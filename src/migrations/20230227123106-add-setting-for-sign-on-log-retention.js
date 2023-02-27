exports.up = function (db, cb) {
    db.runSql(
        `INSERT INTO settings(name, content) VALUES ('sign_on_log_retention', '{"hours": 336}')`,
        cb,
    );
};

exports.down = function (db, cb) {
    db.runSql(`DELETE FROM settings WHERE name = 'sign_on_log_retention'`, cb);
};
