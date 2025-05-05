
export async function up(db, cb) {
    db.runSql('ALTER TABLE roles ADD COLUMN IF NOT EXISTS project text', cb);
};

export async function down(db, cb) {
    cb();
};
