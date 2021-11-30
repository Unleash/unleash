'use strict';

exports.up = function (db, callback) {
    db.runSql(
        'ALTER TABLE projects ADD COLUMN "last_update" TIMESTAMP WITH TIME ZONE',
        callback,
    );
};

exports.down = function (db, callback) {
    db.runSql('ALTER TABLE projects DROP COLUMN "last_update";', callback);
};
