'use strict';

exports.up = function (db, cb) {
    db.runSql(
        `
            INSERT INTO environments(name, type, enabled)
            VALUES ('development', 'development', true),
                   ('production', 'production', true);
        `,
        cb,
    );
};

exports.down = function (db, cb) {
    db.runSql(
        `
        DELETE
        FROM environments
        WHERE name IN ('development', 'production');
    `,
        cb,
    );
};
