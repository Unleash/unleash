'use strict';

exports.up = function (db, cb) {
    db.runSql(
        `
    UPDATE api_tokens SET environment = 'default' WHERE environment = ':global:';
    UPDATE api_tokens SET environment = 'default' WHERE type='client' AND environment is null;
  `,
        cb,
    );
};

exports.down = function (db, cb) {
    db.runSql(
        `
  UPDATE api_tokens SET environment = null WHERE type='client' AND environment = 'default';
  `,
        cb,
    );
};
