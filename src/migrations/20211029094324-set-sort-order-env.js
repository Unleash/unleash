'use strict';

exports.up = function (db, cb) {
    db.runSql(
        `
            UPDATE environments set sort_order = 100 where name = 'development' AND sort_order = 9999;
            UPDATE environments set sort_order = 200 where name = 'production' AND sort_order = 9999;
        `,
        cb,
    );
};

exports.down = function (db, cb) {
    cb();
};
