'use strict';

var dbm;
var type;
var seed;

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function (db, cb) {
    db.runSql(
        `
        ALTER TABLE tag_types
        ADD COLUMN IF NOT EXISTS color VARCHAR(7);
        
        -- Backfill existing tag types with the default color #FFFFFF
        UPDATE tag_types
        SET color = '#FFFFFF'
        WHERE color IS NULL;
        `,
        cb,
    );
};

exports.down = function (db, cb) {
    db.runSql(
        `
        ALTER TABLE tag_types
        DROP COLUMN IF EXISTS color;
        `,
        cb,
    );
};

exports._meta = {
  "version": 1
};
