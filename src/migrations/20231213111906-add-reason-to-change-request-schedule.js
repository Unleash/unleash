export async function up(db, cb) {
    db.runSql(`ALTER TABLE change_request_schedule ADD COLUMN failure_reason text`, cb);
};

export async function down(db, cb) {
    db.runSql(`ALTER TABLE change_request_schedule DROP COLUMN failure_reason`, cb);
};
