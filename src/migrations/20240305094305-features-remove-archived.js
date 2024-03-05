exports.up = function (db, cb) {
    db.runSql(
        `
            ALTER TABLE features DROP COLUMN IF EXISTS archived;
        `,
        cb,
    );
};
