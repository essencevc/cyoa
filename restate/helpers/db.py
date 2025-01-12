import logging
from datetime import datetime
from libsql_client import create_client_sync
from helpers.env import Env
from helpers.story import StoryOutline, FinalStoryNode

logger = logging.getLogger(__name__)


class DatabaseClient:
    _instance = None
    _connection = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._settings = Env()
        return cls._instance

    def get_connection(self):
        from contextlib import contextmanager

        @contextmanager
        def connection():
            for _ in range(3):
                if not self._connection:
                    self._connection = create_client_sync(
                        self._settings.DB_URL,
                        auth_token=self._settings.DB_TOKEN,
                    )

                try:
                    # Test connection
                    self._connection.execute("SELECT * FROM stories LIMIT 1;")
                    break
                except Exception:
                    print("Connection expired, recreating connection")
                    self._connection = None
            else:
                raise Exception(
                    "Failed to establish database connection after 3 attempts"
                )

            try:
                yield self._connection
            finally:
                logger.info("Database connection closed")

        return connection()

    def insert_story(self, story: StoryOutline, user_email: str, story_prompt: str):
        import uuid

        story_id = str(uuid.uuid4())

        with self.get_connection() as conn:
            query = """INSERT INTO stories 
            (id, user_id, title, description, image, status, timestamp, story_prompt) 
            VALUES 
            (?, ?, ?, ?, ?, 'PROCESSING', ?, ?)"""
            params = (
                story_id,
                user_email,
                story.title,
                story.description,
                "",
                int(datetime.now().timestamp()),
                story_prompt,
            )
            print(f"Executing query: {query} with params: {params}")
            conn.execute(query, params)

        return story_id

    def mark_story_as_completed(self, story_id: str):
        try:
            print(f"Marking story {story_id} as completed")
            with self.get_connection() as conn:
                query = "UPDATE stories SET status = 'GENERATED' WHERE id = ?"
                conn.execute(query, (story_id,))

        except Exception as e:
            logger.error(f"Failed to mark story {story_id} as completed: {str(e)}")
            raise

    def insert_story_nodes(
        self, nodes: list[FinalStoryNode], story_id: str, user_id: str
    ):
        with self.get_connection() as conn:
            query = """INSERT INTO story_choices 
                (id, user_id, parent_id, story_id, title, description, choice_title, is_terminal, explored, image_prompt) 
                VALUES 
                (?, ?, ?, ?, ?, ?, ?, ?, ?,?)"""

            try:
                for node in nodes:
                    params = (
                        node.id,
                        user_id,
                        "NULL" if node.parent_id is None else node.parent_id,
                        story_id,
                        node.title,
                        node.description,
                        node.choice_title,
                        1 if node.is_terminal else 0,
                        1 if node.parent_id is None else 0,
                        node.image_description,
                    )
                    conn.execute(query, params)

            except Exception as e:
                logger.error(f"Failed to insert story nodes: {str(e)}")
                raise
