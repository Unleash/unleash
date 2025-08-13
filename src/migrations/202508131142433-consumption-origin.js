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
        `
          CREATE TEMP TABLE tmp_request_count AS
            SELECT
                day,
                metered_group,
                SUM(requests) AS requests
            FROM request_count_consumption
            GROUP BY day, metered_group;

            DELETE FROM request_count_consumption;

            INSERT INTO request_count_consumption (day, metered_group, requests)
            SELECT day, metered_group, requests FROM tmp_request_count;

            DROP TABLE tmp_request_count;

            ALTER TABLE request_count_consumption
            DROP CONSTRAINT request_count_consumption_pkey,
            DROP COLUMN origin,
            ADD PRIMARY KEY(day, metered_group);

            CREATE TEMP TABLE tmp_connection_count AS
            SELECT
                day,
                metered_group,
                SUM(requests) AS requests,
                SUM(connections) AS connections
            FROM connection_count_consumption
            GROUP BY day, metered_group;

            DELETE FROM connection_count_consumption;

            INSERT INTO connection_count_consumption (day, metered_group, requests, connections)
            SELECT day, metered_group, requests, connections FROM tmp_connection_count;

            DROP TABLE tmp_connection_count;

            ALTER TABLE connection_count_consumption
            DROP CONSTRAINT connection_count_consumption_pkey,
            DROP COLUMN origin,
            ADD PRIMARY KEY(day, metered_group);
        `,
        cb
    );
};
