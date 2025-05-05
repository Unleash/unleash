'use strict';

const async = require('async');

function resolveRoleName(permissions) {
    if (!permissions || permissions.length === 0) {
        return 'Viewer';
    }
    if (permissions.includes('ADMIN')) {
        return 'Admin';
    }
    return 'Editor';
}

exports.up = function (db, cb) {
    db.runSql(
        'SELECT id, permissions from users WHERE id NOT IN (select user_id from role_user);',
        (err, results) => {
            if (results.rowCount > 0) {
                const users = results.rows;
                const insertRootRole = users.map((u) => {
                    const roleName = resolveRoleName(u.permissions);
                    return db.runSql.bind(
                        db,
                        `INSERT INTO role_user (role_id, user_id)
                     SELECT id, '${u.id}'
                     FROM roles
                     WHERE name = '${roleName}' AND type = 'root';`,
                    );
                });
                async.series(insertRootRole, cb);
            } else {
                cb();
            }
        },
    );
};

exports.down = function (db, cb) {
    // We can't just remove roles for users as we don't know if there has been any manual additions.
    cb();
};
