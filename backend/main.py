from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
import json
import os
from dotenv import load_dotenv

load_dotenv()

from database import get_db, engine
import models
import schemas
from workflow_engine import WorkflowEngine
from integrations.whatsapp import send_whatsapp_message, verify_webhook

# Create all DB tables on startup
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="FlowMind API", version="1.0.0")

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
            (n for n in canvas.get("nodes", []) if n.get("data", {}).get("type") == "trigger"),
            None
        )
        if trigger_node:
            engine = WorkflowEngine(wf.canvas_json)
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
                     if n.get("data", {}).get("type") == "whatsapp_trigger"),
                    None
                )
                if trigger:
                    engine = WorkflowEngine(wf.canvas_json)
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
