'use strict';

exports.up = function (db, callback) {
    db.runSql(
        `
        ALTER TABLE users ADD "settings" json;
        ALTER TABLE users ADD "permissions" json;
        ALTER TABLE users ALTER COLUMN "permissions" SET DEFAULT '[]';
        ALTER TABLE users DROP COLUMN "system_id";
    `,
        callback,
    );
};

exports.down = function (db, callback) {
    db.runSql(
        `
      ALTER TABLE users DROP COLUMN "settings";
      ALTER TABLE users DROP COLUMN "permissions";
      ALTER TABLE users ADD COLUMN "system_id" VARCHAR;
    `,
        callback,
    );
};
