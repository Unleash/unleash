export async function up(db, cb) {
    db.runSql(
        `
        ALTER TABLE incoming_webhooks ADD COLUMN IF NOT EXISTS description TEXT;
        `,
        cb,
    );
};

export async function down(db, callback) {
    callback();
};
