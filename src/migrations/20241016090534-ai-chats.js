exports.up = function (db, cb) {
    db.runSql(
        `
        CREATE TABLE IF NOT EXISTS ai_chats
        (
            id BIGSERIAL PRIMARY KEY NOT NULL,
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            chat JSONB NOT NULL
        );

        CREATE INDEX IF NOT EXISTS idx_ai_chats_user_id ON ai_chats(user_id);
        `,
        cb,
    );
};

exports.down = function (db, cb) {
    db.runSql(
        `
        DROP INDEX IF EXISTS idx_ai_chats_user_id;
        DROP TABLE IF EXISTS ai_chats;
        `,
        cb,
    );
};
