'use strict';

exports.up = function (db, callback) {
    db.runSql(
        `
            ALTER TABLE project_environments drop column if exists change_request_enabled;
            ALTER TABLE projects drop column if exists change_request_enabled;
        `,
        callback,
    );
};

exports.down = function (db, callback) {
    db.runSql(
        `
            ALTER TABLE project_environments add column if not exists change_request_enabled bool default false;
            ALTER TABLE projects add column if not exists change_request_enabled bool default false;
        `,
        callback,
    );
};
