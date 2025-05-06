'use strict';

exports.up = function (db, callback) {
    db.runSql(
        `
          CREATE TABLE IF NOT EXISTS client_applications_usage (
               app_name VARCHAR(255) REFERENCES client_applications(app_name) ON DELETE CASCADE,
               project VARCHAR(255) REFERENCES projects(id) ON DELETE CASCADE,
               environment VARCHAR(100) REFERENCES environments(name) ON DELETE CASCADE,
               PRIMARY KEY(app_name, project, environment)
          ) ;
        `,
        callback,
    );
};

exports.down = function (db, callback) {
    db.runSql(
        `
           DROP TABLE IF EXISTS client_applications_usage;
        `,
        callback,
    );
};
