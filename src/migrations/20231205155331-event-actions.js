'use strict';

exports.up = function (db, cb) {
    db.runSql(
        `
        CREATE TABLE IF NOT EXISTS event_actions
            (
                id SERIAL PRIMARY KEY NOT NULL,
                event TEXT NOT NULL,
                action TEXT NOT NULL,
                parameters JSONB NOT NULL DEFAULT '{}'::jsonb
            );
        `,
        cb,
    );
};

exports.down = function (db, cb) {
    db.runSql(
        `
        DROP TABLE IF EXISTS event_actions;
        `,
        cb,
    );
};
