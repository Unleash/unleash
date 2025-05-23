'use strict';

exports.up = (db, callback) => {
    db.runSql(`
        ALTER TABLE context_fields
        ADD COLUMN value_type TEXT DEFAULT NULL;
    `, callback);
};

exports.down = (db, callback) => {
    db.runSql(`
        ALTER TABLE context_fields
        DROP COLUMN value_type;
    `, callback);
};
