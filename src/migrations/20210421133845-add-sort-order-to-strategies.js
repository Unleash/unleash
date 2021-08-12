'use strict';

exports.up = function (db, cb) {
    db.runSql(
        `
    ALTER TABLE strategies ADD COLUMN sort_order integer DEFAULT 9999;
    UPDATE strategies SET sort_order = 0 WHERE name = 'default';
    UPDATE strategies SET sort_order = 1 WHERE name = 'flexibleRollout';
    UPDATE strategies SET sort_order = 2 WHERE name = 'userWithId';
    UPDATE strategies SET sort_order = 3 WHERE name = 'remoteAddress';
    UPDATE strategies SET sort_order = 4 WHERE name = 'applicationHostname';
  `,
        cb,
    );
};

exports.down = function (db, cb) {
    db.runSql('ALTER TABLE strategies DROP COLUMN sort_order;', cb);
};
