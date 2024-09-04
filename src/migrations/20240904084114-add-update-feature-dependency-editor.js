exports.up = function (db, cb) {
    db.runSql(
        `
        INSERT INTO role_permission (role_id, permission) SELECT id, 'UPDATE_FEATURE_DEPENDENCY' FROM roles WHERE name = 'Editor' LIMIT 1;
        `,
        cb
    );
};

exports.down = function (db, cb) {
    db.runSql(
        `
        DELETE FROM role_permission WHERE role_id = (SELECT id FROM roles WHERE name = 'Editor') AND permission = 'UPDATE_FEATURE_DEPENDENCY';
        `,
        cb
    );
};
