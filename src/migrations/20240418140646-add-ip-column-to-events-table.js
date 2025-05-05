export async function up(db, cb) {
    db.runSql(`ALTER TABLE events ADD COLUMN ip TEXT`, cb);
};

export async function down(db, cb) {
    db.runSql(`ALTER TABLE events DROP COLUMN ip`, cb);
};
