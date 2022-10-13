'use strict';

exports.up = function (db, cb) {
    db.runSql(
        `
        CREATE TABLE user_achievements (
            id serial primary key,
            achievement_id text not null,
            user_id integer not null references users (id) ON DELETE CASCADE,
            seen_at timestamp with time zone,
            unlocked_at timestamp with time zone not null DEFAULT now()
        );`,
        cb,
    );
};

exports.down = function (db, cb) {
    db.runSql(`drop table user_achievements`, cb);
};
