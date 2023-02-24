'use strict';

exports.up = function (db, cb) {
    db.runSql(
        `
            CREATE TABLE IF NOT EXISTS notifications (
                 id SERIAL PRIMARY KEY,
                 event_id INTEGER NOT NULL REFERENCES  events (id) ON DELETE CASCADE,
                 created_by INTEGER NOT NULL REFERENCES  users (id) ON DELETE CASCADE,
                 created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
            );

            CREATE TABLE if not exists user_notifications
            (
                notification_id INTEGER NOT NULL REFERENCES notifications (id) ON DELETE CASCADE,
                user_id         INTEGER NOT NULL REFERENCES  users (id) ON DELETE CASCADE,
                read_at         TIMESTAMP WITH TIME ZONE,
                PRIMARY KEY (notification_id, user_id)
            );
        `,
        cb,
    );
};

exports.down = function (db, cb) {
    db.runSql(
        `
        DROP TABLE IF EXISTS user_notifications;
        DROP TABLE IF EXISTS notifications;
        `,
        cb,
    );
};
