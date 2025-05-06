'use strict';

exports.up = function (db, cb) {
    db.runSql(
        `
            DELETE FROM onboarding_events_instance;
            DELETE FROM onboarding_events_project;
        `,
        cb,
    );
};

exports.down = function (db, cb) {
    db.runSql(
        ``,
        cb);
};
