'use strict';

exports.up = function (db, cb) {
    db.runSql(
        `
            CREATE TABLE onboarding_events_instance (
                event VARCHAR(255) NOT NULL,
                time_to_event INTEGER NOT NULL,
                PRIMARY KEY (event)
            );

            CREATE TABLE onboarding_events_project (
               event VARCHAR(255) NOT NULL,
               time_to_event INTEGER NOT NULL,
               project VARCHAR(255) REFERENCES projects(id) ON DELETE CASCADE,
               PRIMARY KEY (event, project)
            );

        `,
        cb,
    );
};

exports.down = function (db, cb) {
    db.runSql(
        `
            DROP TABLE IF EXISTS onboarding_events_instance;
            DROP TABLE IF EXISTS onboarding_events_project;
        `,
        cb);
};
