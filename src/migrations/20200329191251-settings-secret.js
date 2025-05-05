/* eslint camelcase: "off" */


import crypto from 'crypto';

const settingsName = 'unleash.secret';

export async function up(db, cb) {
    const secret = crypto.randomBytes(20).toString('hex');

    db.runSql(
        `
    INSERT INTO settings(name, content) 
    VALUES('${settingsName}', '${JSON.stringify(secret)}')`,
        cb,
    );
};

export async function down(db, cb) {
    db.runSql(`DELETE FROM settings WHERE name = '${settingsName}'`, cb);
};
