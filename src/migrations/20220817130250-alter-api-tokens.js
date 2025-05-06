'use strict';

exports.up = function (db, cb) {
    db.runSql(
        `ALTER TABLE api_tokens DROP COLUMN metadata;
         ALTER TABLE api_tokens ADD COLUMN alias text;`,
        cb,
    );
};

exports.down = function (db, cb) {
    db.runSql(
        `ALTER TABLE api_tokens ADD COLUMN metadata JSONB NOT NULL DEFAULT '{}'::jsonb; 
        ALTER TABLE api_tokens DROP COLUMN alias;`,
        cb,
    );
};
