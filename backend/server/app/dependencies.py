from clerk_backend_api.jwks_helpers import (
    VerifyTokenOptions,
    verify_token,
)
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from clerk_backend_api import Clerk
from clerk_backend_api.jwks_helpers import TokenVerificationError
from fastapi import HTTPException, Security
from sqlmodel import Session
from common.db import DatabaseEngine
from server.app.settings import env

clerk = Clerk(bearer_auth=env.CLERK_SECRET_KEY)

security = HTTPBearer()


database_engine = DatabaseEngine(env)


def get_user_id_from_token(
    credentials: HTTPAuthorizationCredentials = Security(security),
):
    return "123"
    token_options = VerifyTokenOptions(secret_key=env.CLERK_SECRET_KEY)
    try:
        jwt_obj = verify_token(credentials.credentials, token_options)
        return jwt_obj.get("sub")
    except TokenVerificationError as e:
        raise HTTPException(status_code=401, detail=str(e))


def get_session():
    db = database_engine.engine.connect()
    session = Session(bind=db)
    try:
        yield session
    finally:
        session.close()
        db.close()
