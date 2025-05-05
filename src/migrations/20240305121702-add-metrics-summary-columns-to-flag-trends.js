'use strict';

exports.up = function(db, cb) {
    db.runSql(
        `
        ALTER TABLE IF EXISTS flag_trends
           ADD COLUMN total_yes integer,
           ADD COLUMN  total_no integer,
           ADD COLUMN  total_apps integer,
           ADD COLUMN  total_environments integer;
        `,
        cb,
    );
};

exports.down = function(db, cb) {
    db.runSql(`ALTER TABLE IF EXISTS flag_trends
        DROP COLUMN IF EXISTS total_no,
        DROP COLUMN IF EXISTS total_apps,
        DROP COLUMN IF EXISTS total_environments,
        DROP COLUMN IF EXISTS total_yes;`
        ,
        cb
    );
};
