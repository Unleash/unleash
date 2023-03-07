'use strict';

exports.up = function (db, cb) {
    db.runSql(
        `INSERT INTO settings(name, content) VALUES ('notifications_retention', '{"hours": 720}')`,
        cb,
    );
};

exports.down = function (db, cb) {
    db.runSql(
        `DELETE FROM settings WHERE name = 'notifications_retention'`,
        cb,
    );
};
