from clerk_backend_api.jwks_helpers import (
    VerifyTokenOptions,
    verify_token,
)
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from clerk_backend_api import Clerk
from clerk_backend_api.jwks_helpers import TokenVerificationError
from fastapi import HTTPException, Security
from sqlmodel import create_engine, Session
from sqlalchemy.pool import QueuePool
from sqlalchemy.orm import sessionmaker

from server.app.helpers.db import get_db_session
from server.app.settings import env
import time

clerk = Clerk(bearer_auth=env.CLERK_SECRET_KEY)

security = HTTPBearer()

SQLALCHEMY_DATABASE_URL = (
    f"sqlite+{env.LIBSQL_URL}/?authToken={env.LIBSQL_TOKEN}&secure=true"
)

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    poolclass=QueuePool,
    pool_size=5,
    max_overflow=10,
    pool_timeout=30,
    pool_recycle=1800,
    connect_args={"check_same_thread": False},
    echo=True,
    pool_pre_ping=True,
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_user_id_from_token(
    credentials: HTTPAuthorizationCredentials = Security(security),
):
    token_options = VerifyTokenOptions(secret_key=env.CLERK_SECRET_KEY)
    try:
        jwt_obj = verify_token(credentials.credentials, token_options)
        return jwt_obj.get("sub")
    except TokenVerificationError as e:
        raise HTTPException(status_code=401, detail=str(e))


def get_session():
    db = SessionLocal()
    try:
        # Convert SQLAlchemy session to SQLModel session to get access to .exec()
        db = Session(bind=db.bind)
        yield db
    finally:
        db.close()
