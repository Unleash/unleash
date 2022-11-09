'use strict';

exports.up = function (db, callback) {
    db.runSql(
        `
            CREATE TABLE IF NOT EXISTS change_request_approvals (
               id serial primary key,
               change_request_id integer NOT NULL REFERENCES change_requests(id) ON DELETE CASCADE,
               created_by integer not null references users (id) ON DELETE CASCADE,
               created_at timestamp default now()
            );
        `,
        callback,
    );
};

exports.down = function (db, callback) {
    db.runSql(
        `
            DROP TABLE IF EXISTS change_request_approvals;
        `,
        callback,
    );
};
