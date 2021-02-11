'use strict';

exports.up = function(db, cb) {
    return db.addColumn(
        'features',
        'project',
        {
            type: 'string',
            defaultValue: 'default',
        },
        cb,
    );
};

exports.down = function(db, cb) {
    return db.removeColumn('features', 'project', cb);
};
