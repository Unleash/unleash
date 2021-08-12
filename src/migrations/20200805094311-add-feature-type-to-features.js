'use strict';

exports.up = function (db, cb) {
    return db.addColumn(
        'features',
        'type',
        {
            type: 'string',
            defaultValue: 'release',
        },
        cb,
    );
};

exports.down = function (db, cb) {
    return db.removeColumn('features', 'type', cb);
};
