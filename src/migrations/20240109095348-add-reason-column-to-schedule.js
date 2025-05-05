
export async function up(db, cb) {
    db.runSql(
        `ALTER TABLE change_request_schedule ADD COLUMN reason TEXT;
         UPDATE change_request_schedule SET reason = failure_reason;`,
        cb,
    );
};

export async function down(db, cb) {
    db.runSql(
        `ALTER TABLE change_request_schedule DROP COLUMN reason;`,
        cb,
    );
};
