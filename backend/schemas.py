from pydantic import BaseModel
from typing import Optional
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
