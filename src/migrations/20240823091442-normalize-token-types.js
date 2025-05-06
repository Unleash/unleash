'use strict';

exports.up = function (db, cb) {
    db.runSql(
        `
        UPDATE api_tokens
        SET type = 'client'
        WHERE type = 'CLIENT';

        UPDATE api_tokens
        SET type = 'admin'
        WHERE type = 'ADMIN';

        UPDATE api_tokens
        SET type = 'frontend'
        WHERE type = 'FRONTEND';
        `,
        cb,
    );
};

exports.down = function (db, cb) {
    db.runSql(``, cb);
};
