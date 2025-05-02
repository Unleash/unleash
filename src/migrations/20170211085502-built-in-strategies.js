'use strict';

import async from 'async';

export async function up(db, cb) {
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

export async function down(db, cb) {
    return db.removeColumn('strategies', 'built_in', cb);
};
