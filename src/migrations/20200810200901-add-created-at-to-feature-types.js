'use strict';

exports.up = function (db, callback) {
    db.runSql(
        'ALTER TABLE feature_types ADD "created_at" TIMESTAMP WITH TIME ZONE default now();',
        callback,
    );
};

exports.down = function (db, callback) {
    db.runSql('ALTER TABLE feature_types DROP COLUMN "created_at";', callback);
};
