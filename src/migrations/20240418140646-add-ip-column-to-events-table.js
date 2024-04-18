exports.up = function (db, cb) {
    db.runSql(`ALTER TABLE events ADD COLUMN ip TEXT`, cb);
};

exports.down = function (db, cb) {
    db.runSql(`ALTER TABLE events DROP COLUMN ip`, cb);
};
