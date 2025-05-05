export async function up(db, cb) {
    db.runSql(
        `
            CREATE TABLE IF NOT EXISTS reset_tokens
            (
                reset_token text PRIMARY KEY         NOT NULL,
                user_id     integer,
                expires_at  timestamp with time zone NOT NULL,
                used_at     timestamp with time zone,
                created_at  timestamp with time zone DEFAULT now(),
                created_by  text,
                FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
            );

        `,
        cb,
    );
};

export async function down(db, cb) {
    db.runSql('DROP TABLE reset_tokens;', cb);
};

export const _meta = {
    version: 1,
};
