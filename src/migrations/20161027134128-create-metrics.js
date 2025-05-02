'use strict';

export async function up(db, callback) {
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

export async function down(db, callback) {
    db.runSql('DROP TABLE client_metrics;', callback);
};
