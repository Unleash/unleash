'use strict';

exports.up = function (db, cb) {
    db.runSql('CREATE INDEX features_archived_idx ON features(archived);', cb);
};

exports.down = function (db, cb) {
    db.runSql('DROP INDEX features_archived_idx;', cb);
};
