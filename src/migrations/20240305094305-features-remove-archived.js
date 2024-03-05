exports.up = function (db, cb) {
    db.runSql(
        `
            ALTER TABLE features DROP COLUMN IF EXISTS archived;
        `,
        cb,
    );
};

exports.down = function (db, cb) {
    db.runSql(
        `
            ALTER TABLE features ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT FALSE;
        `,
        cb,
    );
};
