'use strict';

exports.up = function (db, cb) {
    db.runSql(
        `ALTER TABLE api_tokens_v2
         DROP CONSTRAINT api_tokens_v2_environment_fkey;
         ALTER TABLE api_tokens_v2
         ADD CONSTRAINT api_tokens_v2_environment_fkey
         FOREIGN KEY(environment) REFERENCES environments(name) ON DELETE NO ACTION;`,
        cb,
    );
};

exports.down = function (db, cb) {
    db.runSql(
        `ALTER TABLE api_tokens_v2
         DROP CONSTRAINT api_tokens_v2_environment_fkey;
         ALTER TABLE api_tokens_v2
         ADD CONSTRAINT api_tokens_v2_environment_fkey
         FOREIGN KEY(environment) REFERENCES environments(name) ON DELETE CASCADE;`,
        cb,
    );
};
