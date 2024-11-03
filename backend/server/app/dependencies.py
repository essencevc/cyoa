from clerk_backend_api.jwks_helpers import (
    VerifyTokenOptions,
    verify_token,
)
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from clerk_backend_api import Clerk
from clerk_backend_api.jwks_helpers import TokenVerificationError
from fastapi import HTTPException, Security
from sqlalchemy.exc import SQLAlchemyError
from server.app.helpers.db import get_db_session
from server.app.settings import env
import time

clerk = Clerk(bearer_auth=env.CLERK_SECRET_KEY)

security = HTTPBearer()


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
    max_retries = 3
    retry_delay = 1  # seconds

    for attempt in range(max_retries):
        try:
            with get_db_session() as session:
                yield session
                return
        except TimeoutError:
            if attempt < max_retries - 1:
                time.sleep(retry_delay)
                continue
            raise
        except Exception as e:
            session.rollback()
            raise e
        finally:
            session.close()

    raise TimeoutError("Failed to connect to database after multiple attempts")
