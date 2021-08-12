/* eslint camelcase: "off" */

'use strict';

const crypto = require('crypto');

const settingsName = 'unleash.secret';

exports.up = function (db, cb) {
    const secret = crypto.randomBytes(20).toString('hex');

    db.runSql(
        `
    INSERT INTO settings(name, content) 
    VALUES('${settingsName}', '${JSON.stringify(secret)}')`,
        cb,
    );
};

exports.down = function (db, cb) {
    db.runSql(`DELETE FROM settings WHERE name = '${settingsName}'`, cb);
};
