export async function up(db, cb) {
    db.runSql(
        `
        ALTER TABLE incoming_webhook_tokens RENAME COLUMN secret TO token;
        `,
        cb,
    );
};

export async function down(db, cb) {
    db.runSql(
        `
        ALTER TABLE incoming_webhook_tokens RENAME COLUMN token TO secret;
        `,
        cb,
    );
};
