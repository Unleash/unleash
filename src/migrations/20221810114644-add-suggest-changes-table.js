'use strict';

exports.up = function (db, callback) {
    db.runSql(
        `
CREATE TABLE IF NOT EXISTS suggest_change_set (
  id serial primary key,
  environment varchar(255) NOT NULL,
  state varchar(255) NOT NULL,
  project varchar(255) NOT NULL,
  created_by varchar(255) NOT NULL,
  created_at timestamp default now(),
  updated_by varchar(255)
);

CREATE TABLE IF NOT EXISTS suggest_change (
    id serial primary key,
    action varchar(255) NOT NULL,
    payload json NOT NULL,
    created_by varchar(255) NOT NULL,
    created_at timestamp default now(),
    suggest_change_set_id integer NOT NULL REFERENCES suggest_change_set(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS suggest_change_event (
    id serial primary key,
    event varchar(255) NOT NULL,
    data json NOT NULL,
    created_by varchar(255) NOT NULL,
    created_at timestamp default now(),
    suggest_change_set_id integer NOT NULL REFERENCES suggest_change_set(id) ON DELETE CASCADE
);
`,
        callback,
    );
};

exports.down = function (db, callback) {
    db.runSql(
        `
DROP TABLE IF EXISTS suggest_change;
DROP TABLE IF EXISTS suggest_change_event;
DROP TABLE IF EXISTS suggest_change_set;
        `,
        callback,
    );
};
