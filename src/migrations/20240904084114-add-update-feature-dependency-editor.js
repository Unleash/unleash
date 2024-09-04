exports.up = function (db, cb) {
    db.runSql(
        `
        INSERT INTO role_permission (role_id, permission)
        SELECT id, 'UPDATE_FEATURE_DEPENDENCY'
        FROM roles WHERE name = 'Editor' AND type = 'root'
        AND EXISTS (SELECT 1 FROM roles WHERE name = 'Editor' and type = 'root')
        AND NOT EXISTS (
            SELECT 1
            FROM role_permission
            WHERE role_permission.role_id = (SELECT id FROM roles WHERE name = 'Editor' AND type = 'root')
            AND role_permission.permission = 'UPDATE_FEATURE_DEPENDENCY'
        );
        `,
        cb
    );
};

exports.down = function (db, cb) {
    db.runSql(
        `
        DELETE FROM role_permission
        WHERE role_id = (SELECT id FROM roles WHERE name = 'Editor' AND type = 'root')
        AND permission = 'UPDATE_FEATURE_DEPENDENCY';
        `,
        cb
    );
};
