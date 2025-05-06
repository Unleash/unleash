'use strict';

exports.up = function (db, cb) {
    db.runSql(
        `
        CREATE TABLE IF NOT EXISTS user_splash 
        (user_id INTEGER NOT NULL references users (id) ON DELETE CASCADE, 
        splash_id TEXT, 
        seen BOOLEAN NOT NULL DEFAULT false, 
        PRIMARY KEY (user_id, splash_id));
        CREATE INDEX user_splash_user_id_idx ON user_splash (user_id);
        `,
        cb,
    );
};

exports.down = function (db, cb) {
    db.runSql(
        `
    DROP INDEX user_splash_user_id_idx;
    DROP TABLE user_splash;
`,
        cb,
    );
};
