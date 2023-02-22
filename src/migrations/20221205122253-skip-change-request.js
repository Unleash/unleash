exports.up = function (db, cb) {
    db.runSql(
        `
        INSERT INTO permissions (permission, display_name, type) VALUES ('SKIP_CHANGE_REQUEST', 'Skip change request process', 'environment');
        `,
        cb,
    );
};

exports.down = function (db, cb) {
    db.runSql(
        `
        DELETE FROM permissions WHERE permission = 'SKIP_CHANGE_REQUEST';
  `,
        cb,
    );
};
