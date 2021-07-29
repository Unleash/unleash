/* eslint camelcase: "off" */

'use strict';

exports.up = function (db, cb) {
    return db.createTable(
        'settings',
        {
            name: {
                type: 'string',
                length: 255,
                primaryKey: true,
                notNull: true,
            },
            content: { type: 'json' },
        },
        cb,
    );
};

exports.down = function (db, cb) {
    return db.dropTable('settings', cb);
};
