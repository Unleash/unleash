'use strict';

exports.up = function (db, callback) {
    db.runSql(
        `
        UPDATE events set announced = false where announced IS NULL;
        ALTER TABLE events ALTER COLUMN announced SET NOT NULL;
        ALTER TABLE events ALTER COLUMN announced SET DEFAULT false;
        CREATE INDEX events_unannounced_idx ON events(announced) WHERE announced = false;
        `,
        callback(),
    );
};

exports.down = function (db, callback) {
    callback();
};
