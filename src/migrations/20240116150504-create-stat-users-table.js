exports.up = function(db, cb) {
    db.runSql(`
        CREATE TABLE stat_users(
                created_at TIMESTAMP NOT NULL PRIMARY KEY,
                total INT,
                active_7 INT,
                active_30 INT,
                active_60 INT,
                active_90 INT
        );
    `, cb);
};

exports.down = function(db, cb) {
    db.runSql(`
        DROP TABLE IF EXISTS stat_users;
    `, cb);
};
