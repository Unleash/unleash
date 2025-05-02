/* eslint camelcase: "off" */

'use strict';

import async from 'async';

export async function up(db, cb) {
    async.series(
        [
            db.createTable.bind(db, 'context_fields', {
                name: {
                    type: 'string',
                    length: 255,
                    primaryKey: true,
                    notNull: true,
                },
                description: { type: 'text' },
                sort_order: { type: 'int', defaultValue: 10 },
                legal_values: { type: 'text' },
                created_at: { type: 'timestamp', defaultValue: 'now()' },
                updated_at: { type: 'timestamp', defaultValue: 'now()' },
            }),
            db.runSql.bind(
                db,
                `
        INSERT INTO context_fields(name, description, sort_order) VALUES('environment', 'Allows you to constrain on application environment', 0);
        INSERT INTO context_fields(name, description, sort_order) VALUES('userId', 'Allows you to constrain on userId', 1);
        INSERT INTO context_fields(name, description, sort_order) VALUES('appName', 'Allows you to constrain on application name', 2);
        `,
            ),
        ],
        cb,
    );
};

export async function down(db, cb) {
    return db.dropTable('context_fields', cb);
};
