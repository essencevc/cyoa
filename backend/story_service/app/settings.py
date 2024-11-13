from common.settings import CoreSettings


class Settings(CoreSettings):
    GOOGLE_API_KEY: str

    class Config:
        env_file = "./story_service/.env"


restate_settings = Settings()
