'use strict';

exports.up = function (db, cb) {
    db.runSql(`
        ALTER TABLE api_tokens_v2 ADD COLUMN IF NOT EXISTS application TEXT
            REFERENCES client_applications(app_name) ON DELETE RESTRICT;
        CREATE INDEX IF NOT EXISTS api_tokens_v2_application_idx ON api_tokens_v2(application);
    `, cb);
};

exports.down = function (db, cb) {
    db.runSql('ALTER TABLE api_tokens_v2 DROP COLUMN IF EXISTS application', cb);
};
