'use strict';

exports.up = function (db, cb) {
    db.runSql(
        `
        create index segments_name_index on segments (name);
        `,
        cb,
    );
};

exports.down = function (db, cb) {
    db.runSql(
        `
        drop index segments_name_index;
        `,
        cb,
    );
};
