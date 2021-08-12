'use strict';

exports.up = function (db, cb) {
    db.runSql(
        `
    ALTER TABLE client_applications ADD COLUMN announced boolean DEFAULT false;
    UPDATE client_applications SET announced = true;
  `,
        cb,
    );
};

exports.down = function (db, cb) {
    db.runSql(
        `
            ALTER TABLE client_applications DROP COLUMN announced;
        `,
        cb,
    );
};

exports._meta = {
    version: 1,
};
