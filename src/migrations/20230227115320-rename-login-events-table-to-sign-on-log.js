export async function up(db, cb) {
    db.runSql(`ALTER TABLE login_events RENAME TO sign_on_log`, cb);
};

export async function down(db, cb) {
    db.runSql(`ALTER TABLE sign_on_log RENAME TO login_events`, cb);
};
