from app.settings import env
from libsql_client import create_client_sync


def init_db():
    with create_client_sync(url=env.LIBSQL_URL, auth_token=env.LIBSQL_TOKEN) as client:
        client.execute("DROP TABLE IF EXISTS story")
        client.execute("DROP TABLE IF EXISTS story_node")

        client.execute("""
        CREATE TABLE IF NOT EXISTS stories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            user_id TEXT NOT NULL,
            content JSON,
            status TEXT CHECK(status IN ('submitted', 'running', 'failed', 'completed')) NOT NULL,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );               
        """)
        client.execute("""
        CREATE TABLE IF NOT EXISTS story_node (
            node_id INTEGER PRIMARY KEY AUTOINCREMENT,
            story_id INTEGER NOT NULL,
            parent_node_id INTEGER,
            image_url TEXT NOT NULL,
            setting TEXT NOT NULL,
            consumed BOOLEAN NOT NULL DEFAULT FALSE,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (story_id) REFERENCES story(id),
            FOREIGN KEY (parent_node_id) REFERENCES story_node(node_id)
        );             
        """)
        print("Database initialized")


if __name__ == "__main__":
    init_db()
