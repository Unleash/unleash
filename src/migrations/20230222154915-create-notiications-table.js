'use strict';

exports.up = function (db, cb) {
    db.runSql(
        `
            create table if not exists notifications (
                 id serial primary key,
                 created_at timestamp with time zone not null default now(),
                 read_at timestamp with time zone,
                 user_id integer not null references users (id),
                 event_id integer not null references events (id)
            );`,
        cb,
    );
};

exports.down = function (db, cb) {
    db.runSql(`drop table if exists notifications`, cb);
};
