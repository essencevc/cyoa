from app.db.models import Story, StoryNode
from app.settings import env
from sqlmodel import SQLModel, create_engine, Session


dbUrl = f"sqlite+{env.LIBSQL_URL}/?authToken={env.LIBSQL_TOKEN}&secure=true"

engine = create_engine(
    dbUrl,
    connect_args={"check_same_thread": False},
    echo=True,
)


def create_db_and_tables():
    # Drop all tables first
    SQLModel.metadata.drop_all(engine)
    # Then recreate them
    SQLModel.metadata.create_all(engine)

    # Commit the changes
    with Session(engine) as session:
        session.commit()


create_db_and_tables()
