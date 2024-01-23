'use strict';

exports.up = function (db, callback) {
    db.runSql(
        `
        INSERT INTO users
          (id, name, username, created_by_user_id, is_system) 
        VALUES
          (-42, 'Unleash Admin Token User', 'unleash_admin_token', -1337, true);
        `,
        callback,
    );
};

exports.down = function (db, callback) {
    db.runSql(
        `
        DELETE FROM users WHERE id = -42;
        `,
        callback,
    );
};
