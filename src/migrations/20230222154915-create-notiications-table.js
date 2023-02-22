'use strict';

exports.up = function (db, cb) {
    db.runSql(
        `
            create table if not exists notifications (
                 id serial primary key,
                 created_at timestamp with time zone not null default now(),
                 event_id integer not null references events (id)
            );

            create table if not exists user_notifications (
                id serial primary key,
                notification_id integer not null references notifications (id),
                read_at timestamp with time zone,
                user_id integer not null references users (id)
            )
        `,
        cb,
    );
};

exports.down = function (db, cb) {
    db.runSql(`drop table if exists notifications`, cb);
};
