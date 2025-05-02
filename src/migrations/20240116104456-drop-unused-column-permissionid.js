export async function up(db, cb) {
    db.runSql(
        `
        ALTER TABLE role_permission
        DROP COLUMN permission_id;
        `,
        cb
    );
};

export async function down(db, cb) {
    db.runSql(
        `
        ALTER TABLE role_permission
        ADD COLUMN permission_id INTEGER;
        `,
        cb
    );
};
