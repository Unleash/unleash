'use strict';

exports.up = function (db, callback) {
    db.runSql(
        `
        ALTER TABLE features ADD archived_at TIMESTAMP WITH TIME ZONE;
        UPDATE features f
        SET    archived_at = res.archived_at
            FROM   (SELECT f.name, e.created_at AS archived_at
        FROM   features f
               INNER JOIN events e
                       ON e.feature_name = f.NAME
                          AND e.created_at =
                              (SELECT Max(created_at) date
                               FROM   events
                               WHERE  type = 'feature-archived'
                                      AND e.feature_name = f.NAME)) res
        WHERE  res.NAME = f.NAME;
        UPDATE features
        SET    archived_at = Now()
        WHERE  archived = TRUE
          AND archived_at IS NULL;
        `,
        callback,
    );
};

exports.down = function (db, callback) {
    db.runSql(
        `
        UPDATE features
        SET    archived = TRUE
        WHERE  archived_at IS NOT NULL;
        ALTER TABLE features DROP COLUMN archived_at;
        `,
        callback,
    );
};
