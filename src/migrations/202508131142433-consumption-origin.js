exports.up = function (db, cb) {
    db.runSql(
        `
            ALTER TABLE request_count_consumption
                ADD COLUMN origin TEXT NOT NULL DEFAULT 'sdk';

            ALTER TABLE request_count_consumption
            DROP CONSTRAINT request_count_consumption_pkey,
                ADD PRIMARY KEY(day, metered_group, origin);

            ALTER TABLE connection_count_consumption
                ADD COLUMN origin TEXT NOT NULL DEFAULT 'sdk';

            ALTER TABLE connection_count_consumption
            DROP CONSTRAINT connection_count_consumption_pkey,
                ADD PRIMARY KEY(day, metered_group, origin);
        `,
        cb
    );
};

exports.down = function (db, cb) {
    db.runSql(
        ``,
        cb
    );
};
