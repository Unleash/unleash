'use strict';

exports.up = function (db, callback) {
    db.runSql(
        `
            CREATE TABLE IF NOT EXISTS project_settings (
               project varchar(255) REFERENCES projects(id) ON DELETE CASCADE,
               default_stickiness varchar(100),
               project_mode varchar(100),
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
