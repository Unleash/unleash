export async function up(db, cb) {
    db.runSql(
        `
        INSERT INTO permissions (permission, display_name, type) VALUES ('APPROVE_CHANGE_REQUEST', 'Approve a change request', 'environment');
        INSERT INTO permissions (permission, display_name, type) VALUES ('APPLY_CHANGE_REQUEST', 'Apply a change request', 'environment');
        `,
        cb,
    );
};

export async function down(db, cb) {
    db.runSql(
        `
        DELETE FROM permissions WHERE permission = 'APPROVE_CHANGE_REQUEST';
        DELETE FROM permissions WHERE permission = 'APPLY_CHANGE_REQUEST';
  `,
        cb,
    );
};
