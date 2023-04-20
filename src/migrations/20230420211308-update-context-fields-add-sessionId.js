'use strict';

exports.up = function (db, callback) {
    db.runSql(
        `
            INSERT INTO context_fields(name, description, sort_order, stickiness) VALUES('sessionId', 'Allows you to constrain on sessionId', 4, true);

            UPDATE context_fields
            SET stickiness = true
                WHERE name LIKE 'userId';
        `,
        callback,
    );
};

exports.down = function (db, callback) {
    db.runSql(
        `
            DELETE FROM context_fields
            WHERE name LIKE 'sessionId';

            UPDATE context_fields
            SET stickiness = false
            WHERE name LIKE 'userId';
        `,
        callback,
    );
};
