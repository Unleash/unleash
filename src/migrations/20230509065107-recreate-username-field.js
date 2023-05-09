'use strict';

exports.up = function (db, callback) {
    db.runSql(
        `
        ALTER TABLE api_tokens RENAME COLUMN token_name TO username;
        ALTER TABLE api_tokens ADD COLUMN "token_name" text;
        UPDATE api_tokens SET token_name = username;
      `,
        callback,
    );
};

exports.down = function (db, callback) {
    db.runSql(
        `
      ALTER TABLE api_tokens DROP COLUMN "token_name";
      ALTER TABLE api_tokens RENAME COLUMN username TO token_name;
    `,
        callback,
    );
};
