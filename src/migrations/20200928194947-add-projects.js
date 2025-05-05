/* eslint camelcase: "off" */


import async from 'async';

export async function up(db, cb) {
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

export async function down(db, cb) {
    return db.dropTable('projects', cb);
};
