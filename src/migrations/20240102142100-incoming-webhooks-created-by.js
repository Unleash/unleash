export async function up(db, cb) {
    db.runSql(
        `
        ALTER TABLE incoming_webhooks ALTER COLUMN created_by_user_id DROP NOT NULL;
        ALTER TABLE incoming_webhook_tokens ALTER COLUMN created_by_user_id DROP NOT NULL;
        `,
        cb,
    );
};

export async function down(db, callback) {
    callback();
};
