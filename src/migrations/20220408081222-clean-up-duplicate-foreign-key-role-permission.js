export async function up(db, cb) {
    db.runSql(
        `
        ALTER TABLE role_permission DROP CONSTRAINT fk_role_permission;
    `,
        cb,
    );
};

export async function down(db, cb) {
    cb();
};
