'use strict';

exports.up = function (db, callback) {
    db.runSql(
        `
        SELECT * FROM migrations WHERE name = '/20230426110026-rename-api-token-username-field';
        `,
        (err, results) => {
            if (results.rows.length > 0) {
                db.runSql(
                    `
                ALTER TABLE api_tokens RENAME COLUMN token_name TO username;
                ALTER TABLE api_tokens ADD COLUMN "token_name" text;
                UPDATE api_tokens SET token_name = username;
                DELETE FROM migrations WHERE name = '/20230426110026-rename-api-token-username-field';
              `,
                );
            } else {
                db.runSql(
                    `
                ALTER TABLE api_tokens ADD COLUMN "token_name" text;
                UPDATE api_tokens SET token_name = username;
              `,
                );
            }
            callback();
        },
    );
};

exports.down = function (db, callback) {
    db.runSql(
        `ALTER TABLE api_tokens DROP COLUMN IF EXISTS "token_name";`,
        callback,
    );
};
