'use strict';

exports.up = function (db, cb) {
    db.runSql(
        `
          ALTER TABLE api_tokens DROP CONSTRAINT api_tokens_environment_fkey;
      `,
        cb,
    );
};

exports.down = function (db, cb) {
    db.runSql(
        `
          ALTER TABLE api_tokens DROP CONSTRAINT api_tokens_environment_fkey;
      `,
        cb,
    );
};
