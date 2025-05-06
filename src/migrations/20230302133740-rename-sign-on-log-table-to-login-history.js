exports.up = function (db, cb) {
    db.runSql(`ALTER TABLE sign_on_log RENAME TO login_history`, cb);
    db.runSql(`DELETE FROM settings WHERE name = 'sign_on_log_retention'`, cb);
    db.runSql(
        `INSERT INTO settings(name, content) VALUES ('login_history_retention', '{"hours": 336}')`,
        cb,
    );
};

exports.down = function (db, cb) {
    db.runSql(`ALTER TABLE login_history RENAME TO sign_on_log`, cb);
    db.runSql(
        `DELETE FROM settings WHERE name = 'login_history_retention'`,
        cb,
    );
    db.runSql(
        `INSERT INTO settings(name, content) VALUES ('sign_on_log_retention', '{"hours": 336}')`,
        cb,
    );
};
