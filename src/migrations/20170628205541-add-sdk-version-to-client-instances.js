'use strict';

exports.up = function (db, callback) {
    db.runSql(
        'ALTER TABLE client_instances ADD "sdk_version" varchar(255);',
        callback,
    );
};

exports.down = function (db, callback) {
    db.runSql(
        'ALTER TABLE client_instances DROP COLUMN "sdk_version";',
        callback,
    );
};
