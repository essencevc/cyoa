from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    OPENAI_API_KEY: str
    LIBSQL_URL: str
    LIBSQL_TOKEN: str

    class Config:
        env_file = "./story_service/.env"


restate_settings = Settings()
