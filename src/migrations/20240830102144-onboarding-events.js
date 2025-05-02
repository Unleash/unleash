'use strict';

export async function up(db, cb) {
    db.runSql(
        `
            CREATE TABLE IF NOT EXISTS onboarding_events_instance (
                event VARCHAR(255) NOT NULL,
                time_to_event INTEGER NOT NULL, -- in seconds
                PRIMARY KEY (event)
            );

            CREATE TABLE IF NOT EXISTS onboarding_events_project (
               event VARCHAR(255) NOT NULL,
               time_to_event INTEGER NOT NULL, -- in seconds
               project VARCHAR(255) NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
               PRIMARY KEY (event, project)
            );
        `,
        cb,
    );
};

export async function down(db, cb) {
    db.runSql(
        `
            DROP TABLE IF EXISTS onboarding_events_instance;
            DROP TABLE IF EXISTS onboarding_events_project;
        `,
        cb);
};
