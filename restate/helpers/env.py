from pydantic_settings import BaseSettings


class Env(BaseSettings):
    GOOGLE_API_KEY: str
    DB_URL: str
    DB_TOKEN: str

    class Config:
        env_file = ".env"
