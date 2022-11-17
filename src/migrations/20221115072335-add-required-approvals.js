'use strict';

exports.up = function (db, callback) {
    db.runSql(
        `
            ALTER TABLE change_request_settings ADD COLUMN required_approvals integer default 1;

            ALTER TABLE change_request_settings
                ADD CONSTRAINT change_request_settings_project_environment_key
                    UNIQUE (project, environment)
        `,
        callback,
    );
};

exports.down = function (db, callback) {
    db.runSql(
        `
            ALTER TABLE change_request_settings DROP COLUMN IF EXISTS required_approvals;
            ALTER TABLE change_request_settings
                DROP CONSTRAINT IF EXISTS change_request_settings_project_environment_key;
        `,
        callback,
    );
};
