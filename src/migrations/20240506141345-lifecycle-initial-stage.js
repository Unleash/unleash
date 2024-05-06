exports.up = function (db, cb) {
    db.runSql(
        `
            INSERT INTO feature_lifecycles (feature, stage, created_at)
            SELECT name, 'initial', NOW() AS created_at
            FROM features
            WHERE name NOT IN (
                SELECT feature
                FROM feature_lifecycles
            )
            ON CONFLICT DO NOTHING;
        `,
        cb,
    );
};

exports.down = function (db, cb) {
    db.runSql(
        ``,
        cb,
    );
};
