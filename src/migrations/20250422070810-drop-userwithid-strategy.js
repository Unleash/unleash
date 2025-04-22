'use strict';

exports.up = function (db, callback) {
    db.runSql(
        `
            DELETE FROM strategies
            WHERE name = 'userWithId' AND built_in = 1
        `,
        callback,
    );
};

exports.down = function (db, callback) {
    db.runSql(
        `
            INSERT INTO strategies
            (name, description, parameters, built_in, deprecated, sort_order, display_name) VALUES ('userWithId', 'Enable the feature for a specific set of userIds. Prefer using "Gradual rollout" strategy with user id constraints.', '[{"name":"userIds","type":"list","description":"","required":false}]', 1, true, 2, 'UserIDs');
        `,
        callback,
    );
};
