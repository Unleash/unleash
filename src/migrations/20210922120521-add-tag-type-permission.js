'use strict';

exports.up = function (db, cb) {
    db.runSql(
        `
        INSERT INTO role_permission(role_id, permission)
        VALUES (2, 'UPDATE_TAG_TYPE'),
               (2, 'DELETE_TAG_TYPE');
        INSERT INTO role_permission(role_id, permission, project)
        VALUES (2, 'UPDATE_TAG_TYPE', 'default'),
               (2, 'DELETE_TAG_TYPE', 'default');
    `,
        cb,
    );
};

exports.down = function (db, cb) {
    db.runSql(
        `
        DELETE
        FROM role_permission
        WHERE permission IN ('UPDATE_TAG_TYPE', 'DELETE_TAG_TYPE');
    `,
        cb,
    );
};
