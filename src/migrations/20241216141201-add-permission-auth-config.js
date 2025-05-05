'use strict';

exports.up = function (db, cb) {
    db.runSql(`
        INSERT INTO permissions (permission, display_name, type) VALUES ('UPDATE_AUTH_CONFIGURATION', 'Change authentication settings (SSO)', 'root');
    `, cb);
}

exports.down = function (db, cb) {
    db.runSql(`
        DELETE FROM permissions WHERE permission IN ('UPDATE_AUTH_CONFIGURATION');
    `, cb);
}
