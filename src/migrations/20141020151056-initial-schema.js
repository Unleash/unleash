'use strict';

exports.up = function (db, callback) {
    db.runSql(
        `
CREATE TABLE strategies (
  created_at timestamp default now(),
  name varchar(255) PRIMARY KEY NOT NULL,
  description text
);

CREATE TABLE features (
  created_at timestamp default now(),
  name varchar(255) PRIMARY KEY NOT NULL,
  enabled integer default 0,
  strategy_name varchar(255),
  parameters json
);

CREATE TABLE events (
  id serial primary key,
  created_at timestamp default now(),
  type varchar(255) NOT NULL,
  created_by varchar(255) NOT NULL,
  data json
);
       `,
        callback,
    );
};

exports.down = function (db, callback) {
    db.runSql(
        `
DROP TABLE events;
DROP TABLE features;
DROP TABLE strategies;
        `,
        callback,
    );
};
