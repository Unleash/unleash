export async function up(db, cb) {
    db.runSql('ALTER TABLE roles DROP COLUMN IF EXISTS project', cb);
};

export async function down(db, cb) {
    db.runSql('ALTER TABLE roles ADD COLUMN IF NOT EXISTS project text', cb);
};
