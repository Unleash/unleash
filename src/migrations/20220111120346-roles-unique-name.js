exports.up = function (db, cb) {
    db.runSql(
        `
      ALTER TABLE roles ADD CONSTRAINT unique_name UNIQUE (name);
    `,
        cb,
    );
};

exports.down = function (db, cb) {
    db.runSql(
        `
      ALTER TABLE roles DROP CONSTRAINT unique_name;
`,
        cb,
    );
};
