import logging
from datetime import datetime
import libsql_experimental as libsql
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
        try:
            if not self._connection:
                self._connection = libsql.connect(
                    self._settings.DB_URL,
                    auth_token=self._settings.DB_TOKEN,
                )
                self._connection.execute("SELECT * FROM stories LIMIT 1;")
                logger.info("Database connection successful")
            return self._connection
        except Exception as e:
            logger.error(f"Database connection failed: {str(e)}")
            raise

    def execute_query(self, query: str):
        conn = self.get_connection()
        cursor = conn.cursor()
        try:
            cursor.execute(query)
        except Exception as e:
            logger.error(f"Query execution failed: {str(e)}")
            raise

    def insert_story(self, story: StoryOutline, user_email: str):
        import uuid

        story_id = str(uuid.uuid4())
        conn = self.get_connection()
        cursor = conn.cursor()

        query = """INSERT INTO stories 
            (id, user_id, title, description, image, status, timestamp) 
            VALUES 
            (?, ?, ?, ?, ?, 'PROCESSING', ?)"""
        params = (
            story_id,
            user_email,
            story.title,
            story.description,
            "",
            int(datetime.now().timestamp()),
        )
        print(f"Executing query: {query} with params: {params}")
        cursor.execute(query, params)
        conn.commit()
        return story_id

    def mark_story_as_completed(self, story_id: str):
        print(f"Marking story {story_id} as completed")
        conn = self.get_connection()
        cursor = conn.cursor()
        query = "UPDATE stories SET status = 'GENERATED' WHERE id = ?"
        cursor.execute(query, (story_id,))
        conn.commit()

    def insert_story_nodes(
        self, nodes: list[FinalStoryNode], story_id: str, user_id: str
    ):
        conn = self.get_connection()
        cursor = conn.cursor()

        query = """INSERT INTO story_choices 
            (id, user_id, parent_id, story_id, title, description, is_terminal, explored) 
            VALUES 
            (?, ?, ?, ?, ?, ?, ?, ?)"""

        try:
            for node in nodes:
                params = (
                    node.id,
                    user_id,
                    "NULL" if node.parent_id is None else node.parent_id,
                    story_id,
                    node.title,
                    node.description,
                    1 if node.is_terminal else 0,
                    1 if node.parent_id is None else 0,
                )
                cursor.execute(query, params)

            conn.commit()
        except Exception as e:
            logger.error(f"Failed to insert story nodes: {str(e)}")
            conn.rollback()
            raise
