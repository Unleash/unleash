'use strict';

const async = require('async');

exports.up = function (db, cb) {
    async.series(
        [
            db.addColumn.bind(db, 'strategies', 'built_in', {
                type: 'int',
                defaultValue: 0,
            }),
            db.runSql.bind(
                db,
                "UPDATE strategies SET built_in=1 where name='default'",
            ),
        ],
        cb,
    );
};

exports.down = function (db, cb) {
    return db.removeColumn('strategies', 'built_in', cb);
};
