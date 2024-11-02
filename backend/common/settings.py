from pydantic_settings import BaseSettings
from typing import Optional, Literal


class Settings(BaseSettings):
    CLERK_SECRET_KEY: str
    RESTATE_RUNTIME_ENDPOINT: str
    RESTATE_TOKEN: Optional[str] = None
    ANTHROPIC_API_KEY: str
    LIBSQL_URL: str
    MODAL_ENDPOINT: str
    LIBSQL_TOKEN: Optional[str] = None
    ENV: Literal["development", "production"]

    class Config:
        env_file = ".env"


env = Settings()
