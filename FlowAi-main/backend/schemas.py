from pydantic import BaseModel
from typing import Any, Optional, Union
from datetime import datetime


class WorkflowCreate(BaseModel):
    name: str
    description: Optional[str] = None
    canvas_json: Optional[str] = '{"nodes":[],"edges":[]}'


class WorkflowOut(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    canvas_json: Optional[str] = None
    is_active: bool
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ExecutionOut(BaseModel):
    id: int
    workflow_id: Optional[int] = None
    workflow_name: Optional[str] = None
    trigger_source: Optional[str] = None
    status: Optional[str] = None
    result_data: Optional[str] = None
    duration_ms: Optional[int] = None
    executed_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class GoogleStatusOut(BaseModel):
    configured: bool
    credential_type: Optional[str] = None
    project_id: Optional[str] = None
    client_email: Optional[str] = None
    error: Optional[str] = None


class SheetAppendRequest(BaseModel):
    spreadsheet_id: str
    row: list[Any]
    sheet_name: str = "Sheet1"


class SheetReadRequest(BaseModel):
    spreadsheet_id: str
    range: str = "Sheet1!A1:Z100"


class GmailSendRequest(BaseModel):
    to: str
    subject: str = "Message from FlowMind"
    body: str


class CalendarEventRequest(BaseModel):
    title: str = "FlowMind Event"
    start: str
    end: str
    description: Optional[str] = None
    calendar_id: str = "primary"
    timezone: str = "Asia/Karachi"


class HttpRequest(BaseModel):
    url: str
    method: str = "POST"
    headers: Optional[Union[dict[str, Any], str]] = None
    params: Optional[Union[dict[str, Any], str]] = None
    body: Any = None
    timeout: float = 20
