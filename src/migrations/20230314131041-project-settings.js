'use strict';

exports.up = function (db, callback) {
    db.runSql(
        `
            CREATE TABLE IF NOT EXISTS project_settings (
               project VARCHAR(255) REFERENCES projects(id) ON DELETE CASCADE,
               default_stickiness VARCHAR(100),
               project_mode VARCHAR(100),
               PRIMARY KEY(project)
            );
        `,
        callback,
    );
};

exports.down = function (db, callback) {
    db.runSql(
        `
            DROP TABLE IF EXISTS project_settings;
        `,
        callback,
    );
};
