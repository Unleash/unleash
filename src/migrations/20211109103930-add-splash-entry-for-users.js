exports.up = function (db, cb) {
    db.runSql(`SELECT * FROM users`, (err, results) => {
        results.rows.forEach((user) => {
            db.runSql(
                `INSERT INTO user_splash(splash_id, user_id, seen) SELECT 'environment', u.id, false FROM users u`,
            );
        });
        cb();
    });
};

exports.down = function (db, cb) {
    db.runSql('DELETE FROM user_splash', cb);
};
