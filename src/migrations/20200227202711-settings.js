/* eslint camelcase: "off" */

'use strict';

export async function up(db, cb) {
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

export async function down(db, cb) {
    return db.dropTable('settings', cb);
};
