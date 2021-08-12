exports.up = function (db, cb) {
    db.runSql(
        `
      DELETE FROM users WHERE id IN
        (SELECT id FROM
            (SELECT id, lower(email) as email, row_number() over (PARTITION BY lower(email) ORDER BY id desc) as Row FROM users) as dupes
        WHERE email IS NOT NULL AND dupes.Row > 1);
        UPDATE users SET email = LOWER(email);

    `,
        cb,
    );
};

exports.down = function (db, cb) {
    db.runSql('', cb);
};
