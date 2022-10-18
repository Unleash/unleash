'use strict';

exports.up = function (db, callback) {
    db.runSql(
        `
CREATE TABLE IF NOT EXISTS suggest_change_set (
  id serial primary key,
  environment varchar(255) NOT NULL,
  state varchar(255) NOT NULL,
  project varchar(255) NOT NULL,
  changes text NOT NULL,
  created_by varchar(255) NOT NULL,
  created_at timestamp default now(),
  updated_by varchar(255) NOT NULL,
);
`,
        callback,
    );
};

exports.down = function (db, callback) {
    db.runSql(
        `
DROP TABLE IF EXISTS suggest_change_set;
        `,
        callback,
    );
};
