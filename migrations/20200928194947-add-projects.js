/* eslint camelcase: "off" */

'use strict';

const async = require('async');

exports.up = function(db, cb) {
    async.series(
        [
            db.createTable.bind(db, 'projects', {
                id: {
                    type: 'string',
                    length: 255,
                    primaryKey: true,
                    notNull: true,
                },
                name: { type: 'string', notNull: true },
                description: { type: 'string' },
                created_at: { type: 'timestamp', defaultValue: 'now()' },
            }),
            db.runSql.bind(
                db,
                `
              INSERT INTO projects(id, name, description) VALUES('default', 'Default', 'Default project');
              `,
            ),
        ],
        cb,
    );
};

exports.down = function(db, cb) {
    return db.dropTable('feature_types', cb);
};
