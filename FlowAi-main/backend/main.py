from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timezone
import json
import os
from dotenv import load_dotenv

load_dotenv()

from database import get_db, engine
import models
import schemas
from workflow_engine import WorkflowEngine
from integrations.whatsapp import send_whatsapp_message, verify_webhook
from integrations.google_client import get_google_status
from integrations.sheets import append_sheet_row, read_sheet_values
from integrations.gmail import send_gmail_message
from integrations.calendar import create_calendar_event
from integrations.http_request import execute_http_request

# Create all DB tables on startup
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="FlowMind API", version="1.0.0")


def get_integration_credentials(db: Session, service: str) -> Optional[str]:
    integration = db.query(models.Integration).filter(
        models.Integration.service == service
    ).first()
    if not integration or not integration.credentials:
        return None

    try:
        data = json.loads(integration.credentials)
    except json.JSONDecodeError:
        return integration.credentials

    if isinstance(data, dict):
        value = data.get("credentials_json") or data.get("google_credentials_json")
        if isinstance(value, dict):
            return json.dumps(value)
        if isinstance(value, str):
            return value
        if data.get("type") or data.get("refresh_token"):
            return json.dumps(data)
    return None


def get_google_credentials_for_service(db: Session, service: str) -> Optional[str]:
    return (
        get_integration_credentials(db, service)
        or get_integration_credentials(db, "google")
        or os.getenv("GOOGLE_CREDENTIALS_JSON")
    )


def get_integration_payload(db: Session, service: str) -> dict:
    integration = db.query(models.Integration).filter(
        models.Integration.service == service,
        models.Integration.is_connected == True,
    ).first()
    if not integration or not integration.credentials:
        return {}
    try:
        data = json.loads(integration.credentials)
        return data if isinstance(data, dict) else {}
    except json.JSONDecodeError:
        return {}


def workflow_credentials(db: Session) -> dict:
    credentials = {}
    for service in ("google", "sheets", "gmail", "calendar"):
        value = get_google_credentials_for_service(db, service)
        if value:
            credentials[service] = value
    for service in ("whatsapp", "openai", "webhook", "database", "slack", "instagram", "twitter", "facebook", "stripe"):
        value = get_integration_payload(db, service)
        if value:
            credentials[service] = value
    return credentials

# CORS — allow your Vercel frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        os.getenv("FRONTEND_URL", "*"),
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─────────────────────────────────────────────
# HEALTH CHECK
# ─────────────────────────────────────────────
@app.get("/")
def root():
    return {"status": "FlowMind API running", "version": "1.0.0"}

@app.get("/health")
def health():
    return {"status": "ok"}

# ─────────────────────────────────────────────
# WORKFLOWS
# ─────────────────────────────────────────────
@app.get("/api/workflows", response_model=List[schemas.WorkflowOut])
def list_workflows(db: Session = Depends(get_db)):
    return db.query(models.Workflow).order_by(models.Workflow.created_at.desc()).all()

@app.post("/api/workflows", response_model=schemas.WorkflowOut)
def create_workflow(data: schemas.WorkflowCreate, db: Session = Depends(get_db)):
    wf = models.Workflow(
        name=data.name,
        description=data.description,
        canvas_json=data.canvas_json,
        is_active=True,
    )
    db.add(wf)
    db.commit()
    db.refresh(wf)
    return wf

@app.get("/api/workflows/{wf_id}", response_model=schemas.WorkflowOut)
def get_workflow(wf_id: int, db: Session = Depends(get_db)):
    wf = db.query(models.Workflow).filter(models.Workflow.id == wf_id).first()
    if not wf:
        raise HTTPException(status_code=404, detail="Workflow not found")
    return wf

@app.put("/api/workflows/{wf_id}", response_model=schemas.WorkflowOut)
def update_workflow(wf_id: int, data: schemas.WorkflowCreate, db: Session = Depends(get_db)):
    wf = db.query(models.Workflow).filter(models.Workflow.id == wf_id).first()
    if not wf:
        raise HTTPException(status_code=404, detail="Workflow not found")
    wf.name = data.name
    wf.description = data.description
    wf.canvas_json = data.canvas_json
    db.commit()
    db.refresh(wf)
    return wf

@app.delete("/api/workflows/{wf_id}")
def delete_workflow(wf_id: int, db: Session = Depends(get_db)):
    wf = db.query(models.Workflow).filter(models.Workflow.id == wf_id).first()
    if not wf:
        raise HTTPException(status_code=404, detail="Workflow not found")
    db.delete(wf)
    db.commit()
    return {"deleted": True}

@app.post("/api/workflows/{wf_id}/toggle")
def toggle_workflow(wf_id: int, db: Session = Depends(get_db)):
    wf = db.query(models.Workflow).filter(models.Workflow.id == wf_id).first()
    if not wf:
        raise HTTPException(status_code=404, detail="Workflow not found")
    wf.is_active = not wf.is_active
    db.commit()
    return {"is_active": wf.is_active}

# ─────────────────────────────────────────────
# EXECUTE WORKFLOW MANUALLY
# ─────────────────────────────────────────────
@app.post("/api/workflows/{wf_id}/run")
async def run_workflow(wf_id: int, payload: dict = {}, db: Session = Depends(get_db)):
    wf = db.query(models.Workflow).filter(models.Workflow.id == wf_id).first()
    if not wf:
        raise HTTPException(status_code=404, detail="Workflow not found")
    
    execution = models.Execution(
        workflow_id=wf_id,
        trigger_source="manual",
        trigger_data=json.dumps(payload),
        status="running",
    )
    db.add(execution)
    db.commit()

    try:
        canvas = json.loads(wf.canvas_json or '{"nodes":[],"edges":[]}')
        trigger_node = next(
            (
                n for n in canvas.get("nodes", [])
                if (n.get("data", {}).get("type") or n.get("type")) in (
                    "trigger",
                    "whatsapp_trigger",
                    "instagram_trigger",
                )
            ),
            None
        )
        if not trigger_node and canvas.get("nodes"):
            trigger_node = canvas["nodes"][0]
        if trigger_node:
            engine = WorkflowEngine(wf.canvas_json, credentials=workflow_credentials(db))
            result = await engine.execute(trigger_node["id"], payload)
        else:
            result = {"message": "No trigger node found"}
        
        execution.status = "success"
        execution.result_data = json.dumps(result)
    except Exception as e:
        execution.status = "failed"
        execution.result_data = json.dumps({"error": str(e)})

    db.commit()
    return {"status": execution.status, "result": execution.result_data}

# ─────────────────────────────────────────────
# STATS (Dashboard)
# ─────────────────────────────────────────────
@app.get("/api/stats")
def get_stats(db: Session = Depends(get_db)):
    total = db.query(models.Execution).count()
    success = db.query(models.Execution).filter(models.Execution.status == "success").count()
    active_wf = db.query(models.Workflow).filter(models.Workflow.is_active == True).count()
    success_rate = round((success / total * 100), 1) if total > 0 else 0.0

    return {
        "active_workflows": active_wf,
        "total_executions": total,
        "success_rate": success_rate,
        "avg_runtime": "2.4s",
    }

# ─────────────────────────────────────────────
# EXECUTIONS / LOGS
# ─────────────────────────────────────────────
@app.get("/api/logs", response_model=List[schemas.ExecutionOut])
def get_logs(
    status: Optional[str] = None,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    q = db.query(models.Execution).order_by(models.Execution.executed_at.desc())
    if status and status != "all":
        q = q.filter(models.Execution.status == status)
    return q.limit(limit).all()

# ─────────────────────────────────────────────
# INTEGRATIONS
# ─────────────────────────────────────────────
@app.get("/api/integrations")
def get_integrations(db: Session = Depends(get_db)):
    integrations = db.query(models.Integration).all()
    return [
        {
            "id": i.id,
            "service": i.service,
            "is_connected": i.is_connected,
        }
        for i in integrations
    ]

@app.post("/api/integrations/{service}/connect")
def connect_integration(service: str, data: dict, db: Session = Depends(get_db)):
    integ = db.query(models.Integration).filter(models.Integration.service == service).first()
    if not integ:
        integ = models.Integration(service=service)
        db.add(integ)
    integ.credentials = json.dumps(data)
    integ.is_connected = True
    integ.connected_at = datetime.now(timezone.utc)
    db.commit()
    return {"status": "connected", "service": service}

@app.post("/api/integrations/{service}/disconnect")
def disconnect_integration(service: str, db: Session = Depends(get_db)):
    integ = db.query(models.Integration).filter(models.Integration.service == service).first()
    if integ:
        integ.is_connected = False
        integ.credentials = None
        db.commit()
    return {"status": "disconnected"}


@app.get("/api/integrations/google/status", response_model=schemas.GoogleStatusOut)
def google_status(db: Session = Depends(get_db)):
    credentials_json = get_google_credentials_for_service(db, "google")
    return get_google_status(credentials_json)


@app.post("/api/google/sheets/append")
def google_sheets_append(data: schemas.SheetAppendRequest, db: Session = Depends(get_db)):
    credentials_json = get_google_credentials_for_service(db, "sheets")
    try:
        return append_sheet_row(
            spreadsheet_id=data.spreadsheet_id,
            row=data.row,
            sheet_name=data.sheet_name,
            credentials_json=credentials_json,
        )
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@app.post("/api/google/sheets/read")
def google_sheets_read(data: schemas.SheetReadRequest, db: Session = Depends(get_db)):
    credentials_json = get_google_credentials_for_service(db, "sheets")
    try:
        return read_sheet_values(
            spreadsheet_id=data.spreadsheet_id,
            sheet_range=data.range,
            credentials_json=credentials_json,
        )
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@app.post("/api/google/gmail/send")
def google_gmail_send(data: schemas.GmailSendRequest, db: Session = Depends(get_db)):
    credentials_json = get_google_credentials_for_service(db, "gmail")
    try:
        return send_gmail_message(
            to=data.to,
            subject=data.subject,
            body=data.body,
            credentials_json=credentials_json,
        )
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@app.post("/api/google/calendar/events")
def google_calendar_create_event(
    data: schemas.CalendarEventRequest,
    db: Session = Depends(get_db),
):
    credentials_json = get_google_credentials_for_service(db, "calendar")
    try:
        return create_calendar_event(
            title=data.title,
            start=data.start,
            end=data.end,
            description=data.description or "",
            calendar_id=data.calendar_id,
            timezone=data.timezone,
            credentials_json=credentials_json,
        )
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@app.post("/api/tools/http-request")
async def tools_http_request(data: schemas.HttpRequest):
    try:
        return await execute_http_request(data.model_dump())
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc))

# ─────────────────────────────────────────────
# WHATSAPP WEBHOOK
# ─────────────────────────────────────────────
@app.get("/webhook/whatsapp")
async def whatsapp_verify(request: Request):
    params = dict(request.query_params)
    token = os.getenv("WA_VERIFY_TOKEN", "flowmind_secret")
    if (params.get("hub.mode") == "subscribe" and
            params.get("hub.verify_token") == token):
        return int(params.get("hub.challenge", 0))
    raise HTTPException(status_code=403, detail="Verification failed")

@app.post("/webhook/whatsapp")
async def whatsapp_incoming(request: Request, db: Session = Depends(get_db)):
    try:
        body = await request.json()
        entry = body.get("entry", [{}])[0]
        changes = entry.get("changes", [{}])[0]
        value = changes.get("value", {})
        messages = value.get("messages", [])

        if not messages:
            return {"status": "no_message"}

        msg = messages[0]
        text = msg.get("text", {}).get("body", "")
        from_number = msg.get("from", "")

        # Save message to DB
        message = models.Message(
            channel="whatsapp",
            direction="inbound",
            sender=from_number,
            content=text,
        )
        db.add(message)
        db.commit()

        # Find active WhatsApp workflow and execute it
        workflows = db.query(models.Workflow).filter(models.Workflow.is_active == True).all()
        for wf in workflows:
            try:
                canvas = json.loads(wf.canvas_json or '{"nodes":[],"edges":[]}')
                trigger = next(
                    (n for n in canvas.get("nodes", [])
                     if (n.get("data", {}).get("type") or n.get("type")) == "whatsapp_trigger"),
                    None
                )
                if trigger:
                    engine = WorkflowEngine(wf.canvas_json, credentials=workflow_credentials(db))
                    await engine.execute(trigger["id"], {
                        "text": text,
                        "from": from_number,
                        "channel": "whatsapp"
                    })
            except Exception:
                pass

        return {"status": "ok"}
    except Exception as e:
        return {"status": "error", "detail": str(e)}
