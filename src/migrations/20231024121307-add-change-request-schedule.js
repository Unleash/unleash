'use strict';

export async function up(db, callback) {
    db.runSql(
        `
            CREATE TABLE IF NOT EXISTS change_request_schedule (
             change_request INTEGER PRIMARY KEY REFERENCES change_requests(id) ON DELETE CASCADE,
             scheduled_at TIMESTAMP NOT NULL
            );
        `,
        callback,
    );
};

export async function down(db, callback) {
    db.runSql(
        `
            DROP TABLE IF EXISTS change_request_schedule;
        `,
        callback,
    );
};
