exports.up = function (db, callback) {
    db.runSql(
        'ALTER TABLE features ADD "last_seen_at" TIMESTAMP WITH TIME ZONE;',
        callback,
    );
};

exports.down = function (db, cb) {
    return db.removeColumn('features', 'last_seen_at', cb);
};
