exports.up = function (db, cb) {
    db.runSql(`ALTER TABLE login_events RENAME TO sign_on_log`, cb);
};

exports.down = function (db, cb) {
    db.runSql(`ALTER TABLE sign_on_log RENAME TO login_events`, cb);
};
