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
          ALTER TABLE api_tokens ADD CONSTRAINT api_tokens_environment_fkey FOREIGN KEY(environment) REFERENCES environments(name) ON DELETE CASCADE;
      `,
        cb,
    );
};
