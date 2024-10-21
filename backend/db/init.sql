CREATE TABLE stories (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    content JSON,
    status TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);