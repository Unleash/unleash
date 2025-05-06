/* eslint camelcase: "off" */

'use strict';

exports.up = function (db, cb) {
    return db.createTable(
        'users',
        {
            id: {
                type: 'serial',
                primaryKey: true,
                notNull: true,
                autoIncrement: true,
            },
            name: { type: 'string', length: 255 },
            username: { type: 'string', length: 255, unique: true },
            system_id: { type: 'string', length: 255 },
            email: { type: 'string', length: 255, unique: true },
            image_url: { type: 'string', length: 255 },
            password_hash: { type: 'string', length: 255 },
            login_attempts: { type: 'int', defaultValue: 0 },
            created_at: { type: 'timestamp', defaultValue: 'now()' },
            seen_at: { type: 'timestamp' },
        },
        cb,
    );
};

exports.down = function (db, cb) {
    return db.dropTable('users', cb);
};
