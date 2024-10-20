CREATE TABLE stories (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    content JSON,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);