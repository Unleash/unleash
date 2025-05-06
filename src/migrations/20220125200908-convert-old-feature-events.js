'use strict';

exports.up = function (db, cb) {
    db.runSql(
        `
        UPDATE events
        SET feature_name = E.feature_name
        FROM (
            SELECT id, data->>'name' AS feature_name 
            FROM events 
            WHERE type IN ('feature-created', 'feature-updated', 'feature-archived', 'feature-stale-on', 'feature-stale-off') 
            AND feature_name is null
        ) AS E
        WHERE events.id = E.id;
        `,
        cb,
    );
};

exports.down = function (db, cb) {
    cb();
};
