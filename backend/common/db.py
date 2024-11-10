import time
from typing import Generator
from sqlmodel import Session, create_engine, text
from sqlalchemy.engine import Engine
from common.settings import core_settings
import logging


logger = logging.getLogger(__name__)


class DatabaseEngine:
    _instance = None
    _engine = None
    _sessionLocal = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    @property
    def engine(self) -> Engine:
        for attempt in range(3):
            try:
                if not self._engine or not self._engine.pool:
                    self._engine = create_engine(
                        core_settings.db_url,
                        pool_pre_ping=True,
                        pool_recycle=30,
                        connect_args={"check_same_thread": False},
                    )
                    self._engine.connect().execute(text("SELECT 1"))
                return self._engine
            except Exception as e:
                logger.error(
                    f"Database connection attempt {attempt + 1} failed: {str(e)}"
                )
                if self._engine:
                    self._engine.dispose()
                    self._engine = None
                if attempt == 2:
                    raise
                time.sleep(1)

    def get_session(self) -> Generator[Session, None, None]:
        db = Session(bind=self.engine)
        try:
            yield db
        finally:
            db.close()
