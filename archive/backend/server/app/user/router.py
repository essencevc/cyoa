from common.models import User
from sqlmodel import select, Session
from fastapi import APIRouter, Depends
from server.app.dependencies import get_user_id_from_token, get_session

router = APIRouter(prefix="/user", tags=["user"])

@router.get("/get_credits")
async def get_credits(user_id: str = Depends(get_user_id_from_token), session: Session = Depends(get_session)):
    user = session.exec(select(User).where(User.user_id == user_id)).first()    
    return {"credits": user.credits}
