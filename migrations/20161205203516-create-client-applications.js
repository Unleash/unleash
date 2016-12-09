/* eslint camelcase: "off" */
'use strict';

exports.up = function (db, cb) {
    db.createTable('client_applications', {
        app_name: { type: 'varchar', length: 255, primaryKey: true, notNull: true },
        created_at: { type: 'timestamp', defaultValue: 'now()' },
        updated_at: { type: 'timestamp', defaultValue: 'now()' },
        seen_at: { type: 'timestamp' },
        strategies: { type: 'json' },
        description: { type: 'varchar', length: 255 },
        icon: { type: 'varchar', length: 255 },
        url: { type: 'varchar', length: 255 },
        color: { type: 'varchar', length: 255 },
    }, cb);
};

exports.down = function (db, cb) {
    return db.dropTable('client_applications', cb);
};
