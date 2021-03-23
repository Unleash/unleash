'use strict';

exports.up = function(db, cb) {
    db.runSql(
        `CREATE TABLE IF NOT EXISTS api_tokens
          (
              id          SERIAL PRIMARY KEY,
              secret      text not null UNIQUE,
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

exports.down = function(db, cb) {
    db.runSql('DROP TABLE api_tokens;', cb);
};
