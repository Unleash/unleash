'use strict';

exports.up = function (db, callback) {
    db.runSql(
        `
        UPDATE events
        SET project = NULL
        WHERE type = 'segment-created'
          AND project = 'no-project'
          AND NOT EXISTS (
            SELECT 1
            FROM projects
            WHERE name = 'no-project'
        );
        `,
        callback,
    );
};

exports.down = function (db, callback) {
    db.runSql(
        ``,
        callback,
    );
};
