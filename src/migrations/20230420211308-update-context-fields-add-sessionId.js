'use strict';

exports.up = function (db, callback) {
    db.runSql(
        `
            INSERT INTO context_fields(name, description, sort_order, stickiness) VALUES('sessionId', 'Allows you to constrain on sessionId', 4, true) ON CONFLICT DO NOTHING;

            UPDATE context_fields
            SET stickiness = true
                WHERE name LIKE 'userId' AND stickiness is null;
        `,
        callback,
    );
};

exports.down = function (db, callback) {
    db.runSql(
        `
        `,
        callback,
    );
};
