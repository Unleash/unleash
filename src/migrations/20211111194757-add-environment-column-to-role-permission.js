'use strict';

exports.up = function (db, cb) {
    db.runSql(
        'ALTER TABLE role_permission ADD COLUMN environment varchar(255);',
        cb,
    );
};

exports.down = function (db, cb) {
    db.runSql('ALTER TABLE role_permission DROP COLUMN environment', cb);
};
