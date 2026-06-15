from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
import time
import uuid
from backend.app.services.auth import get_current_user
from backend.app.database.db import get_db
from backend.app.models.schemas import PromptRequest, PromptResponse, HistoryItem, ThreadResponse
from backend.app.models.db_model import Prompt, Thread
from backend.app.services.router import route_prompt
from backend.app.services.cost import calculate_cost, savings

router = APIRouter(prefix = "/api", tags = ["Prompts"])

from fastapi import BackgroundTasks

def save_log_to_db(new_log: Prompt, db: Session):
    try:
        db.add(new_log)
        db.commit()
    except Exception as e:
        print(f"Failed to log prompt to DB: {e}")

@router.post("/prompt", response_model=PromptResponse)
async def handle_Prompt(request: PromptRequest, background_tasks: BackgroundTasks, db: Session = Depends(get_db), user_id: uuid.UUID = Depends(get_current_user)):
    start_time = time.time()
        # Fetch history if the user is typing in an existing thread!
    history = None
    if request.thread_id:
        # Get the previous messages in this conversation via chronologic order
        history = db.query(Prompt).filter(Prompt.thread_id == request.thread_id).order_by(Prompt.created_at.asc()).all()

    # Pass the history context directly into the Router Engine!
    response_text, complexity, model_used, input_tokens, output_tokens = route_prompt(request.prompt, history)

    cost = round(calculate_cost(model_used, input_tokens, output_tokens), 6)
    amount_saved = round(savings(cost, input_tokens, output_tokens), 6)
    end_time = time.time()
    response_time = round((end_time - start_time), 3)
    
    new_log = Prompt(
        user_id=user_id,
        thread_id=request.thread_id,
        prompt=request.prompt,
        response=response_text,
        predicted_complexity=complexity,
        model_used=model_used,
        input_tokens=input_tokens,
        output_tokens=output_tokens,
        estimated_cost=cost,
        savings=amount_saved,
        response_time=response_time
    )
    
    # Hand off the DB commit to the background so the user gets the response instantly
    background_tasks.add_task(save_log_to_db, new_log, db)

    return PromptResponse(
        response=response_text,
        predicted_complexity=complexity,
        model_used=model_used,
        input_tokens=input_tokens,
        output_tokens=output_tokens,
        estimated_cost=cost,
        savings=amount_saved,
        response_time=response_time
    )

@router.post("/threads", response_model=ThreadResponse)
async def create_thread(title: str = "New Chat", db: Session = Depends(get_db), user_id: uuid.UUID = Depends(get_current_user)):
    new_thread = Thread(user_id=user_id, title=title[:50]) # Limit title to 50 chars
    db.add(new_thread)
    db.commit()
    db.refresh(new_thread)
    return new_thread

from sqlalchemy import func

@router.get("/threads", response_model=list[ThreadResponse])
async def get_threads(db: Session = Depends(get_db), user_id: uuid.UUID = Depends(get_current_user)):
    return db.query(Thread).outerjoin(Prompt).filter(Thread.user_id == user_id).group_by(Thread.id).order_by(
        func.coalesce(func.max(Prompt.created_at), Thread.created_at).desc()
    ).all()


@router.get("/history", response_model = list[HistoryItem])
async def get_history(db : Session = Depends(get_db), user_id: uuid.UUID = Depends(get_current_user)):
    logs = db.query(Prompt).filter(Prompt.user_id == user_id).order_by(Prompt.created_at.desc()).all()
    return logs