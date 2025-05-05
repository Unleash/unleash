exports.up = function (db, cb) {
    db.runSql(
        `CREATE TABLE IF NOT EXISTS addons
       (
           id          SERIAL PRIMARY KEY,
           provider    text not null,
           description text,
           enabled     boolean default true,
           parameters  json,
           events      json,
           created_at  TIMESTAMP WITH TIME ZONE DEFAULT now()
       );
      `,
        cb,
    );
};

exports.down = function (db, cb) {
    db.runSql('DROP TABLE addons;', cb);
};
