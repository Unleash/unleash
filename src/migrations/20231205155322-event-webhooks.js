'use strict';

exports.up = function (db, cb) {
    db.runSql(
        `
        CREATE TABLE IF NOT EXISTS event_webhooks
            (
                id SERIAL PRIMARY KEY NOT NULL,
                enabled BOOLEAN DEFAULT true NOT NULL,
                name TEXT NOT NULL,
                event TEXT NOT NULL,
                url TEXT NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
            );
        `,
        cb,
    );
};

exports.down = function (db, cb) {
    db.runSql(
        `
        DROP TABLE IF EXISTS event_webhooks;
        `,
        cb,
    );
};
