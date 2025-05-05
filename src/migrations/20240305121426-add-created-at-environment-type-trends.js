'use strict';

exports.up = function(db, cb) {
    db.runSql(
        `
        ALTER TABLE IF EXISTS environment_type_trends
            ADD COLUMN created_at timestamp default now();
        `,
        cb,
    );
};

exports.down = function(db, cb) {
    db.runSql('ALTER TABLE IF EXISTS environment_type_trends DROP COLUMN IF EXISTS created_at;', cb);
};
