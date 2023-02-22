exports.up = function (db, cb) {
    db.runSql(
        `
        DELETE FROM permissions WHERE permission = 'READ_USER_PAT';
        DELETE FROM permissions WHERE permission = 'CREATE_USER_PAT';
        DELETE FROM permissions WHERE permission = 'DELETE_USER_PAT';
        `,
        cb,
    );
};

exports.down = function (db, cb) {
    db.runSql(
        `
        INSERT INTO permissions (permission, display_name, type) VALUES ('READ_USER_PAT', 'Read PATs for a specific user', 'root');
        INSERT INTO permissions (permission, display_name, type) VALUES ('CREATE_USER_PAT', 'Create a PAT for a specific user', 'root');
        INSERT INTO permissions (permission, display_name, type) VALUES ('DELETE_USER_PAT', 'Delete a PAT for a specific user', 'root');
  `,
        cb,
    );
};
