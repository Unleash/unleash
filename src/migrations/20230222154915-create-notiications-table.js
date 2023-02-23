'use strict';

exports.up = function (db, cb) {
    db.runSql(
        `
            create table if not exists notifications (
                 id serial primary key,
                 event_id integer not null references events (id),
                 createdBy integer not null references users (id),
                 created_at timestamp with time zone not null default now()
            );

            create table if not exists user_notifications
            (
                notification_id integer not null references notifications (id),
                user_id         integer not null references users (id),
                read_at         timestamp with time zone,
                primary key (notification_id, user_id)
            )
        `,
        cb,
    );
};

exports.down = function (db, cb) {
    db.runSql(`drop table if exists notifications`, cb);
};
