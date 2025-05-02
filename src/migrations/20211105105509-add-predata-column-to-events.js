'use strict';

export async function up(db, cb) {
    db.runSql(`ALTER TABLE events ADD COLUMN pre_data jsonb;`, cb);
};

export async function down(db, cb) {
    db.runSql(`ALTER TABLE events DROP COLUMN pre_data;`, cb);
};
