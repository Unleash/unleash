'use strict';

exports.up = function (db, callback) {
    db.runSql(
        `
            CREATE TABLE IF NOT EXISTS change_request_rejections (
               id SERIAL PRIMARY KEY,
               change_request_id INTEGER NOT NULL REFERENCES change_requests(id) ON DELETE CASCADE,
               created_by INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
               created_at TIMESTAMP DEFAULT now(),
               UNIQUE (change_request_id, created_by)
            );
        `,
        callback,
    );
};

exports.down = function (db, callback) {
    db.runSql(
        `
            DROP TABLE IF EXISTS change_request_rejections;
        `,
        callback,
    );
};
