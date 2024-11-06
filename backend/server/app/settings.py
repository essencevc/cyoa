from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    CLERK_SECRET_KEY: str
    RESTATE_RUNTIME_ENDPOINT: str
    RESTATE_TOKEN: Optional[str] = None
    LIBSQL_URL: str
    MODAL_ENDPOINT: str
    LIBSQL_TOKEN: Optional[str] = None
    OPENAI_API_KEY: str

    class Config:
        env_file = ".env"


env = Settings()
