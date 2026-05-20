from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.sql import func
from database import Base


class Workflow(Base):
    __tablename__ = "workflows"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, default="Untitled Workflow")
    description = Column(String(500), nullable=True)
    canvas_json = Column(Text, nullable=True)   # React Flow nodes + edges as JSON
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class Execution(Base):
    __tablename__ = "executions"

    id = Column(Integer, primary_key=True, index=True)
    workflow_id = Column(Integer, ForeignKey("workflows.id"), nullable=True)
    workflow_name = Column(String(255), nullable=True)
    trigger_source = Column(String(50), nullable=True)  # 'whatsapp','gmail','manual'
    trigger_data = Column(Text, nullable=True)           # raw incoming payload
    status = Column(String(20), nullable=True)           # 'success','failed','running'
    result_data = Column(Text, nullable=True)
    duration_ms = Column(Integer, nullable=True)
    executed_at = Column(DateTime(timezone=True), server_default=func.now())


class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    channel = Column(String(20), nullable=True)     # 'whatsapp','gmail','instagram'
    direction = Column(String(10), nullable=True)   # 'inbound','outbound'
    sender = Column(String(255), nullable=True)
    content = Column(Text, nullable=True)
    ai_reply = Column(Text, nullable=True)
    received_at = Column(DateTime(timezone=True), server_default=func.now())


class Integration(Base):
    __tablename__ = "integrations"

    id = Column(Integer, primary_key=True, index=True)
    service = Column(String(50), unique=True, nullable=False)  # 'whatsapp','gmail' etc
    credentials = Column(Text, nullable=True)                  # JSON string
    is_connected = Column(Boolean, default=False)
    connected_at = Column(DateTime(timezone=True), nullable=True)


class Contact(Base):
    __tablename__ = "contacts"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=True)
    phone = Column(String(20), nullable=True)
    email = Column(String(255), nullable=True)
    source = Column(String(20), nullable=True)  # 'whatsapp','instagram' etc
    created_at = Column(DateTime(timezone=True), server_default=func.now())
