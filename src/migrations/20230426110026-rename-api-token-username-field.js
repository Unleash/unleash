/* eslint camelcase: "off" */
'use strict';

exports.up = function (db, cb) {
    db.runSql(
        `
      ALTER TABLE api_tokens RENAME COLUMN username TO token_name;
    `,
        cb,
    );
};

exports.down = function (db, cb) {
    db.runSql(
        `
      ALTER TABLE api_tokens RENAME COLUMN token_name TO username;
    `,
        cb,
    );
};
