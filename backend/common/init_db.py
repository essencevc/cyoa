from models import Story, StoryNode
from sqlmodel import SQLModel, create_engine, Session
from settings import core_settings


engine = create_engine(
    core_settings.db_url,
    connect_args={"check_same_thread": False},
    echo=True,
)


def create_db_and_tables():
    # Drop all tables first
    SQLModel.metadata.drop_all(engine, checkfirst=True)
    # Then recreate them
    SQLModel.metadata.create_all(engine)

    # Commit the changes
    with Session(engine) as session:
        session.commit()


create_db_and_tables()
