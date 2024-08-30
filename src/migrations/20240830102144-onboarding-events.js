'use strict';

exports.up = function (db, cb) {
    db.runSql(
        `
            CREATE TABLE onboarding_events (
               event VARCHAR(255) NOT NULL,
               diff INTEGER NOT NULL,
               project VARCHAR(255),
               PRIMARY KEY (event, project)
            );
        `,
        cb,
    );
};

exports.down = function (db, cb) {
    db.runSql(
        `
            DROP TABLE IF EXISTS onboarding_events;
        `,
        cb);
};
