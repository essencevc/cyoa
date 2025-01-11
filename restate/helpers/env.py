from pydantic_settings import BaseSettings


class Env(BaseSettings):
    GOOGLE_API_KEY: str
    DB_URL: str
    DB_TOKEN: str
    AUDIO_ENDPOINT: str
    IMAGE_ENDPOINT: str
    RESTATE_ENDPOINT: str
    RESTATE_TOKEN: str
    AWS_SECRET_ACCESS_KEY: str
    AWS_ACCESS_KEY_ID: str
    AWS_REGION: str

    class Config:
        env_file = ".env"
