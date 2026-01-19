exports.up = function (db, cb) {
    db.runSql(
        `
        SELECT assign_unleash_permission_to_role('UPDATE_PROJECT_SEGMENT', 'Owner');
        `,
        cb,
    );
};

exports.down = function (db, cb) {
    db.runSql(
        `
        DELETE FROM role_permission
        WHERE permission = 'UPDATE_PROJECT_SEGMENT'
        AND role_id = (SELECT id from roles WHERE name = 'Owner' AND type = 'project' LIMIT 1);
        `,
        cb,
    );
};
