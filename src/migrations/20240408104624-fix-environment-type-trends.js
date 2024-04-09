exports.up = function (db, cb) {
    db.runSql(
        `
    -- 1. Clear the environment_type_trends table
    TRUNCATE TABLE environment_type_trends;

    -- 2. Prepare staging table
    with staging_environment_type_trends as (
        SELECT
            seu.day,
            e.type AS environment_type,
            SUM(seu.updates) AS total_updates
        FROM
            stat_environment_updates AS seu
                JOIN
            environments AS e ON seu.environment = e.name
        GROUP BY
            seu.day,
            e.type
        ORDER BY
            seu.day,
            e.type
    ),
    -- 3. Aggregate per week
    set as (
          SELECT
                 environment_type,
                 SUM(total_updates) AS total_updates,
                 date_trunc('week', day) AS week_start,
                 CONCAT(EXTRACT(YEAR FROM date_trunc('week', day))::TEXT, '-', LPAD(EXTRACT(WEEK FROM date_trunc('week', day))::TEXT, 2, '0')) AS id
             FROM
                 staging_environment_type_trends
             GROUP BY
                 environment_type,
                 date_trunc('week', day)
    ),
    -- 4. Find correlating created dates
    created as (
        select distinct id, created_at from flag_trends
    )
    -- 5. Insert aggregated data with dates into environment_type_trends
    INSERT INTO environment_type_trends (id, environment_type, total_updates, created_at)
    SELECT
        CONCAT(EXTRACT(YEAR FROM set.week_start)::TEXT, '-', LPAD(EXTRACT(WEEK FROM set.week_start)::TEXT, 2, '0')) AS id,
        set.environment_type,
        SUM(set.total_updates) AS total_updates,
        created.created_at
    FROM set
        JOIN created ON set.id = created.id
    GROUP BY
        set.environment_type,
        set.week_start,
        created.created_at
    ORDER BY
        set.week_start;
        `,
        cb,
    );
};

exports.down = function (db, cb) {
    db.runSql(
        `
        `,
        cb,
    );
};
