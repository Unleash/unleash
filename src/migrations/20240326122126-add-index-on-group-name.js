export async function up(db, cb) {
    db.runSql(
        `CREATE INDEX IF NOT EXISTS groups_group_name_idx ON groups(name)`,
        cb,
    );
};

export async function down(db, cb) {
    db.runSql(`DROP INDEX IF EXISTS groups_group_name_idx`, cb);
};
