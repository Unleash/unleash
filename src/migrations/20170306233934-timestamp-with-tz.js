'use strict';

exports.up = function (db, callback) {
    db.runSql(
        `
ALTER TABLE events ALTER COLUMN created_at TYPE TIMESTAMP WITH TIME ZONE;
ALTER TABLE features ALTER COLUMN created_at TYPE TIMESTAMP WITH TIME ZONE;
ALTER TABLE strategies ALTER COLUMN created_at TYPE TIMESTAMP WITH TIME ZONE;
ALTER TABLE client_applications ALTER COLUMN created_at TYPE TIMESTAMP WITH TIME ZONE;
ALTER TABLE client_applications ALTER COLUMN updated_at TYPE TIMESTAMP WITH TIME ZONE;
ALTER TABLE client_applications ALTER COLUMN seen_at TYPE TIMESTAMP WITH TIME ZONE;
ALTER TABLE client_instances ALTER COLUMN created_at TYPE TIMESTAMP WITH TIME ZONE;
ALTER TABLE client_instances ALTER COLUMN last_seen TYPE TIMESTAMP WITH TIME ZONE;
ALTER TABLE client_metrics ALTER COLUMN created_at TYPE TIMESTAMP WITH TIME ZONE;
       `,
        callback,
    );
};

exports.down = function (db, callback) {
    callback();
};
