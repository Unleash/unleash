'use strict';

exports.up = function (db, callback) {
    db.runSql(
        `UPDATE settings SET content = jsonb_set(content::jsonb, '{enabled}', 'false'::jsonb) WHERE name = 'unleash.enterprise.auth.google';`,
        callback,
    );
};

