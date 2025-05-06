exports.up = function (db, cb) {
    db.runSql(
        `
    ALTER TABLE environments ADD COLUMN sort_order integer DEFAULT 9999, ADD COLUMN type text;
  `,
        cb,
    );
};

exports.down = function (db, cb) {
    db.runSql(
        `
    ALTER TABLE environments DROP COLUMN sort_order, DROP COLUMN type;
  `,
        cb,
    );
};

exports._meta = {
    version: 1,
};
