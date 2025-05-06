'use strict';

exports.up = function(db, cb) {
    db.runSql(
        `
            CREATE INDEX IF NOT EXISTS idx_client_applications_announced_false ON client_applications (announced)
                WHERE announced = FALSE;
        `,
        cb,
    );
};

exports.down = function(db, cb) {
    db.runSql(`
        DROP INDEX IF EXISTS idx_client_applications_announced_false;
    `, cb);
};
