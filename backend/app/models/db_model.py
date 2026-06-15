from sqlalchemy import Column, Integer, String, DateTime, Numeric, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
import uuid
import datetime
from backend.app.database.db import Base

class Thread(Base):
    __tablename__ = "threads"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), index=True)
    title = Column(String, default="New Chat")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Prompt(Base):
    __tablename__ = "prompts"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), index=True)
    thread_id = Column(UUID(as_uuid=True), ForeignKey("threads.id"), nullable=True)
    prompt = Column(String, nullable=False)
    response = Column(String, nullable=False)
    predicted_complexity = Column(String(10), nullable=False) # 'simple', 'moderate', 'hard'
    model_used = Column(String(50), nullable=False)
    input_tokens = Column(Integer,nullable=False)
    output_tokens = Column(Integer,nullable=False)
    estimated_cost = Column(Numeric(10, 6),nullable=False)
    savings = Column(Numeric(10,6), nullable=False)
    response_time = Column(Numeric(6, 3), nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    
