from common.settings import env
from sqlmodel import create_engine, Session


def get_db_url():
    return f"sqlite+{env.LIBSQL_URL}/?authToken={env.LIBSQL_TOKEN}&secure=true"


def get_db_session():
    engine = create_engine(
        get_db_url(),
        connect_args={"check_same_thread": False},
    )
    return Session(bind=engine)
