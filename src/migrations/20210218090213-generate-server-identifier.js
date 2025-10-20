'use strict';

const { randomUUID } = require('crypto');

exports.up = function (db, cb) {
    const instanceId = randomUUID();
    db.runSql(
        `
    INSERT INTO settings(name, content) VALUES ('instanceInfo', json_build_object('id', '${instanceId}'));
  `,
        cb,
    );
};

exports.down = function (db, cb) {
    db.runSql(
        `
        DELETE FROM settings WHERE name = 'instanceInfo'
        `,
        cb,
    );
};
