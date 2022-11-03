'use strict';

exports.up = function (db, callback) {
    db.runSql(
        `
            CREATE TABLE IF NOT EXISTS change_requests (
              id serial primary key,
              environment varchar(100) REFERENCES environments(name) ON DELETE CASCADE,
              state varchar(255) NOT NULL,
              project varchar(255) REFERENCES projects(id) ON DELETE CASCADE,
              created_by integer not null references users (id) ON DELETE CASCADE,
              created_at timestamp default now()
            );

            CREATE TABLE IF NOT EXISTS change_request_events (
                id serial primary key,
                feature varchar(255) NOT NULL references features(name) on delete cascade,
                action varchar(255) NOT NULL,
                payload jsonb not null default '[]'::jsonb,
                created_by integer not null references users (id) ON DELETE CASCADE,
                created_at timestamp default now(),
                change_request_id integer NOT NULL REFERENCES change_requests(id) ON DELETE CASCADE,
                UNIQUE (feature, action, change_request_id)
            );
        `,
        callback,
    );
};

exports.down = function (db, callback) {
    db.runSql(
        `
        DROP TABLE IF EXISTS change_request_events;
        DROP TABLE IF EXISTS change_requests;
        `,
        callback,
    );
};
