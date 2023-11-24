exports.up = function (db, cb) {
    db.runSql(
        `
        ALTER TABLE role_permission
        DROP COLUMN permission_id;
        `,
        cb
    );
};

exports.down = function (db, cb) {
    db.runSql(
        `
        ALTER TABLE role_permission
        ADD COLUMN permission_id INTEGER;
        `,
        cb
    );
};
