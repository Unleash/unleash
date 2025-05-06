'use strict';

exports.up = function (db, callback) {
    db.runSql(
        `
            CREATE TABLE IF NOT EXISTS change_request_comments (
             id SERIAL PRIMARY KEY,
             change_request INTEGER NOT NULL REFERENCES change_requests(id) ON DELETE CASCADE,
             text TEXT NOT NULL,
             created_at TIMESTAMP default now(),
             created_by INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE
            );
        `,
        callback,
    );
};

exports.down = function (db, callback) {
    db.runSql(
        `
            DROP TABLE IF EXISTS change_request_comments;
        `,
        callback,
    );
};
