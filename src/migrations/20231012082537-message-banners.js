'use strict';

exports.up = function (db, cb) {
    db.runSql(
        `
        CREATE TABLE IF NOT EXISTS message_banners
            (
                id SERIAL PRIMARY KEY NOT NULL,
                enabled BOOLEAN DEFAULT true NOT NULL,
                message TEXT NOT NULL,
                variant TEXT,
                sticky BOOLEAN DEFAULT false,
                icon TEXT,
                link TEXT,
                link_text TEXT,
                dialog_title TEXT,
                dialog TEXT,
                created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
            );
        `,
        cb,
    );
};

exports.down = function (db, cb) {
    db.runSql(
        `
        DROP TABLE IF EXISTS message_banners;
        `,
        cb,
    );
};
