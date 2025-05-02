'use strict';

export async function up(db, callback) {
    db.runSql(
        `
            CREATE TABLE IF NOT EXISTS change_request_settings (
               project varchar(255) REFERENCES projects(id) ON DELETE CASCADE,
               environment varchar(100) REFERENCES environments(name) ON DELETE CASCADE,
               PRIMARY KEY(project, environment)
            );
        `,
        callback,
    );
};

export async function down(db, callback) {
    db.runSql(
        `
            DROP TABLE IF EXISTS change_request_settings;
        `,
        callback,
    );
};
