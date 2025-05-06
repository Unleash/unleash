'use strict';

exports.up = function (db, cb) {
    db.runSql(
        `
    DELETE FROM events WHERE type = 'application-created';
    UPDATE client_applications SET announced = false;
  `,
        cb,
    );
};

exports.down = function (db, cb) {
    cb();
};
