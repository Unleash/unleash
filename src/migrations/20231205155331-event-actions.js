'use strict';

exports.up = function (db, cb) {
    db.runSql(
        `
        CREATE TABLE IF NOT EXISTS event_actions
            (
                id SERIAL PRIMARY KEY NOT NULL,
                event TEXT NOT NULL,
                enabled BOOLEAN DEFAULT true NOT NULL,
                name TEXT,
                action TEXT NOT NULL,
                parameters JSONB NOT NULL DEFAULT '{}'::jsonb,
                sort_order INTEGER NOT NULL DEFAULT 9999,
                created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
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
