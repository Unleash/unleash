exports.up = function (db, cb) {
    db.runSql(
        `
            ALTER TABLE users
                ALTER COLUMN image_url TYPE text;
        `,
        cb,
    );
};

exports.down = function (db, cb) {
    db.runSql(
        `
            ALTER TABLE users
                ALTER COLUMN image_url TYPE VARCHAR(255);
        `,
        cb,
    );
};
