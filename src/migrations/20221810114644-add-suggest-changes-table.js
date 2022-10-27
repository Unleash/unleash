'use strict';

exports.up = function (db, callback) {
    db.runSql(
        `
CREATE TABLE IF NOT EXISTS suggest_change_set (
  id serial primary key,
  environment varchar(100) REFERENCES environments(name) ON DELETE CASCADE,
  state varchar(255) NOT NULL,
  project varchar(255) REFERENCES projects(id) ON DELETE CASCADE,
  created_by integer not null references users (id) ON DELETE CASCADE,
  created_at timestamp default now()
);

CREATE TABLE IF NOT EXISTS suggest_change (
    id serial primary key,
    feature varchar(255) NOT NULL references features(name) on delete cascade,
    action varchar(255) NOT NULL,
    payload jsonb not null default '[]'::jsonb,
    created_by integer not null references users (id) ON DELETE CASCADE,
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
DROP TABLE IF EXISTS suggest_change_set;
        `,
        callback,
    );
};
