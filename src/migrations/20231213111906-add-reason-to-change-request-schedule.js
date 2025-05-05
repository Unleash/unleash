exports.up = function(db, cb) {
    db.runSql(`ALTER TABLE change_request_schedule ADD COLUMN failure_reason text`, cb);
};

exports.down = function(db, cb) {
    db.runSql(`ALTER TABLE change_request_schedule DROP COLUMN failure_reason`, cb);
};
