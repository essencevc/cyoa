from common.settings import CoreSettings
from typing import Optional


class Settings(CoreSettings):
    CLERK_SECRET_KEY: str
    RESTATE_RUNTIME_ENDPOINT: str
    RESTATE_TOKEN: Optional[str] = None
    OPENAI_API_KEY: str

    class Config:
        env_file = ".env"


env = Settings()
