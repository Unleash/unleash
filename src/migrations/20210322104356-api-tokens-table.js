'use strict';

exports.up = function (db, cb) {
    db.runSql(
        `CREATE TABLE IF NOT EXISTS api_tokens
          (
              secret      text not null PRIMARY KEY,
              username    text not null,
              type        text not null,
              created_at  TIMESTAMP WITH TIME ZONE DEFAULT now(),
              expires_at  TIMESTAMP WITH TIME ZONE,
              seen_at     TIMESTAMP WITH TIME ZONE
          );
        `,
        cb,
    );
};

exports.down = function (db, cb) {
    db.runSql('DROP TABLE IF EXISTS api_tokens;', cb);
};
