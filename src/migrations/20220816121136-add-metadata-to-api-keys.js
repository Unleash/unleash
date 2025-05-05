
export async function up(db, cb) {
    db.runSql(
        `ALTER TABLE api_tokens ADD COLUMN metadata JSONB NOT NULL DEFAULT '{}'::jsonb;`,
        cb,
    );
};

export async function down(db, cb) {
    db.runSql('ALTER TABLE api_tokens DROP COLUMN metadata;', cb);
};
