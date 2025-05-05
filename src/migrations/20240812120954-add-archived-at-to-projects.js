
export async function up(db, callback) {
    db.runSql(
        `
        CREATE INDEX idx_events_created_at_desc ON events (created_at DESC);
        `,
        callback,
    );
};

export async function down(db, callback) {
    db.runSql(
        `
        DROP INDEX IF EXISTS idx_events_created_at_desc;
        `,
        callback,
    );
};
