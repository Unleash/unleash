exports.up = (db, callback) => {
        db.runSql(
        `CREATE TABLE IF NOT EXISTS cdn_tokens
         (
              id          text not null PRIMARY KEY,
              token_name  text not null,
              project     text not null,
              environment text not null,
              created_at  TIMESTAMP WITH TIME ZONE DEFAULT now(),
              expires_at  TIMESTAMP WITH TIME ZONE,
              seen_at     TIMESTAMP WITH TIME ZONE
          );
        `,
        callback,
    );
};

exports.down = (db, callback) => {
    db.runSql('DROP TABLE IF EXISTS cdn_tokens;', callback);
};
