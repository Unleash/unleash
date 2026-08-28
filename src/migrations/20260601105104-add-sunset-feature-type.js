'use strict';

exports.up = function (db, cb) {
    db.runSql(
        `
        INSERT INTO feature_types(id, name, description, lifetime_days)
        VALUES('sunset', 'Sunset', 'Used to gradually reduce exposure and remove a feature from the code.', 90);
        `,
        cb,
    );
};

exports.down = function (db, cb) {
    db.runSql(
        `
        DELETE FROM feature_types WHERE id = 'sunset';
        `,
        cb,
    );
};
