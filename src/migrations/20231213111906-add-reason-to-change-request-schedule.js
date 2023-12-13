exports.up = function(db, cb) {
    db.runSql(`ALTER TABLE change_request_schedule ADD COLUMN reason text`, cb);
};

exports.down = function(db, cb) {
    db.runSql(`ALTER TABLE change_request_schedule DROP COLUMN reason`, cb);
};
