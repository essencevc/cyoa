from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    CLERK_SECRET_KEY: str
    RESTATE_RUNTIME_ENDPOINT: str
    RESTATE_TOKEN: str
    ANTHROPIC_API_KEY: str

    class Config:
        env_file = ".env"


env = Settings()
