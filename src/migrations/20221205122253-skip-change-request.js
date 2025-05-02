export async function up(db, cb) {
    db.runSql(
        `
        INSERT INTO permissions (permission, display_name, type) VALUES ('SKIP_CHANGE_REQUEST', 'Skip change request process', 'environment');
        `,
        cb,
    );
};

export async function down(db, cb) {
    db.runSql(
        `
        DELETE FROM permissions WHERE permission = 'SKIP_CHANGE_REQUEST';
  `,
        cb,
    );
};
