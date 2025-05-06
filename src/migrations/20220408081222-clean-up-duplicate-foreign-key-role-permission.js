exports.up = function (db, cb) {
    db.runSql(
        `
        ALTER TABLE role_permission DROP CONSTRAINT fk_role_permission;
    `,
        cb,
    );
};

exports.down = function (db, cb) {
    cb();
};
