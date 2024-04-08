exports.up = function (db, cb) {
    db.runSql(
        `
-- 1. Clear the environment_type_trends table
TRUNCATE TABLE environment_type_trends;

-- 2. Create a temporary staging table for pre-processing
CREATE TEMPORARY TABLE staging_environment_type_trends (
   day DATE,
   environment_type VARCHAR,
   total_updates INT
);

-- 3. Aggregate per day and environmentType and insert into the staging table
INSERT INTO staging_environment_type_trends (day, environment_type, total_updates)
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
    e.type;

-- 4. Aggregate the staging table per iso-week and environmentType, setting created_at based on the week before a date from flag_trends
INSERT INTO environment_type_trends (id, environment_type, total_updates, created_at)
SELECT
    CONCAT(EXTRACT(YEAR FROM set.week_start)::TEXT, '-', LPAD(EXTRACT(WEEK FROM set.week_start)::TEXT, 2, '0')) AS id,
    set.environment_type,
    SUM(set.total_updates) AS total_updates,
    set.week_start AS created_at
FROM (
         SELECT
             environment_type,
             SUM(total_updates) AS total_updates,
             date_trunc('week', day) - INTERVAL '1 week' AS week_start
         FROM
             staging_environment_type_trends
         GROUP BY
             environment_type,
             date_trunc('week', day) - INTERVAL '1 week'
     ) AS set
         JOIN (
    SELECT
            date_trunc('week', created_at) - INTERVAL '1 week' AS week_start
    FROM
        flag_trends
    GROUP BY
            date_trunc('week', created_at) - INTERVAL '1 week'
) AS ft ON set.week_start = ft.week_start
GROUP BY
    set.environment_type,
    set.week_start
ORDER BY
    set.week_start;

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
