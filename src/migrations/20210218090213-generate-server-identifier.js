'use strict';

const { v4: uuidv4 } = require('uuid');

exports.up = function (db, cb) {
    const instanceId = uuidv4();
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
