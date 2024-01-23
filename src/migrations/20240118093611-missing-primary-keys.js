'use strict';

exports.up = function (db, callback) {
    db.runSql(
        `
        ALTER TABLE project_stats ADD PRIMARY KEY (project);
        ALTER TABLE api_token_project ADD PRIMARY KEY (secret, project);
        ALTER TABLE role_permission ADD COLUMN id SERIAL PRIMARY KEY;
        `,
        callback,
    );
};

exports.down = function (db, callback) {
    db.runSql(
        `
        ALTER TABLE project_stats DROP CONSTRAINT project_stats_pkey;
        ALTER TABLE api_token_project DROP CONSTRAINT api_token_project_pkey;
        ALTER TABLE role_permission DROP CONSTRAINT role_permission_pkey;
        ALTER TABLE role_permission DROP COLUMN id;
        `,
        callback,
    );
};
