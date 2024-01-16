exports.up = function(db, cb) {
    db.runSql(`
        CREATE TABLE stat_users(
                created_at TIMESTAMP NOT NULL PRIMARY KEY,
                users_total INT,
                users_active_7 INT,
                users_active_30 INT,
                users_active_60 INT,
                users_active_90 INT
        );
    `, cb);
};

exports.down = function(db, cb) {
    db.runSql(`
        DROP TABLE IF EXISTS stat_users;
    `, cb);
};
