exports.up = function (db, cb) {
    db.runSql(
        `
    ALTER TABLE environments ADD COLUMN enabled BOOLEAN DEFAULT true;
  `,
        cb,
    );
};

exports.down = function (db, cb) {
    db.runSql(
        `
    ALTER TABLE environments DROP COLUMN enabled;
  `,
        cb,
    );
};

exports._meta = {
    version: 1,
};
