'use strict';

exports.up = function (db, callback) {
    db.runSql('DROP TABLE client_metrics;', callback);
};

exports.down = function (db, callback) {
    db.runSql(
        `
CREATE TABLE client_metrics (
  id serial primary key,
  created_at timestamp default now(),
  metrics json
);`,
        callback,
    );
};
