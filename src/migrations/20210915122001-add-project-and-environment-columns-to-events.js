'use strict';

exports.up = function (db, cb) {
    db.runSql(
        `
        ALTER TABLE events
            ADD COLUMN project TEXT;
        ALTER TABLE events
            ADD COLUMN environment TEXT;
        CREATE INDEX events_project_idx ON events(project);
        CREATE INDEX events_environment_idx ON events(environment);
    `,
        cb,
    );
};

exports.down = function (db, cb) {
    db.runSql(
        `
        DROP INDEX events_environment_idx;
        DROP INDEX events_project_idx;
        ALTER TABLE events
            DROP COLUMN environment;
        ALTER TABLE events
            DROP COLUMN project;
    `,
        cb,
    );
};
