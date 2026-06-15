from pydantic import BaseModel
from typing import Optional
import datetime
import uuid

class ThreadResponse(BaseModel):
    id: uuid.UUID
    title: str
    created_at: datetime.datetime
    class Config:
        from_attributes = True

class PromptRequest(BaseModel):
    prompt: str
    thread_id: Optional[uuid.UUID] = None

class PromptResponse(BaseModel):
    response:str
    predicted_complexity:str
    model_used:str
    estimated_cost:float
    savings:float
    response_time:float
    input_tokens:int
    output_tokens:int

class HistoryItem(BaseModel):
    id:uuid.UUID
    thread_id: Optional[uuid.UUID] = None
    prompt:str
    predicted_complexity: str
    model_used: str
    input_tokens: Optional[int]
    output_tokens: Optional[int]
    estimated_cost: Optional[float]
    savings: Optional[float]
    response_time: Optional[float]
    response: Optional[str]
    created_at: datetime.datetime
    class Config:
        from_attributes = True