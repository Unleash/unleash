'use strict';

exports.up = function (db, callback) {
    db.runSql(
        `
        ALTER TABLE users ADD COLUMN IF NOT EXISTS is_system BOOLEAN NOT NULL DEFAULT FALSE;
        INSERT INTO users
          (id, name, username, email, created_by_user_id, is_system) 
        VALUES
          (-1337, 'Unleash System', 'unleash_system_user', 'system@getunleash.io', -1337, true);
        `,
        callback,
    );
};

exports.down = function (db, callback) {
    db.runSql(
        `
        ALTER TABLE users DROP COLUMN IF EXISTS is_system;
        DELETE FROM users WHERE id = -1337;
        `,
        callback,
    );
};
