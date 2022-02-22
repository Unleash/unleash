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
        'ALTER TABLE roles ADD COLUMN IF NOT EXISTS project text', cb
    );
};

exports.down = function (db, cb) {
    // We can't just remove roles for users as we don't know if there has been any manual additions.
    cb();
};
