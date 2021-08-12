exports.up = function (db, cb) {
    db.runSql(
        `
    ALTER TABLE projects ADD COLUMN health integer DEFAULT 100;
  `,
        cb,
    );
};

exports.down = function (db, cb) {
    db.runSql(
        `
    ALTER TABLE projects DROP COLUMN health;
  `,
        cb,
    );
};

exports._meta = {
    version: 1,
};
