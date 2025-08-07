exports.up = function (db, cb) {
    db.runSql(
        `
            DELETE FROM lifecycle_trends;

            WITH week_ranges AS (
                SELECT
                    to_char(week_start, 'YYYY') || '-' || lpad(extract(week from week_start)::int::text, 2, '0') AS id,
                    week_start,
                    week_start + INTERVAL '7 days' AS week_end,
                week_start + INTERVAL '7 days' + INTERVAL '1 hour' AS created_at
                FROM (
                    SELECT date_trunc('day', now() AT TIME ZONE 'UTC') - INTERVAL '1 day' AS current_day
                ) AS t
                CROSS JOIN LATERAL (
                    SELECT generate_series(
                    t.current_day - ((extract(dow from t.current_day)::int + 7) % 7) * INTERVAL '1 day' - INTERVAL '51 weeks',
                    t.current_day - ((extract(dow from t.current_day)::int + 7) % 7) * INTERVAL '1 day',
                    INTERVAL '1 week'
                    ) AS week_start
                ) AS weeks
            ),
            feature_data AS (
                SELECT
                    fl.created_at AT TIME ZONE 'UTC' AS lifecycle_time,
                    fl.stage,
                    f.type AS flag_type,
                    f.project,
                    fl.feature
                FROM feature_lifecycles fl
                    JOIN features f ON f.name = fl.feature
                    JOIN projects p ON f.project = p.id
                    ),
            weekly_counts AS (
                SELECT
                    wr.id,
                    wr.created_at,
                    fd.stage,
                    fd.flag_type,
                    fd.project,
                    COUNT(DISTINCT CASE WHEN fd.lifecycle_time >= wr.week_start AND fd.lifecycle_time < wr.week_end THEN fd.feature END) AS new_flags_this_week,
                    COUNT(DISTINCT CASE WHEN fd.lifecycle_time < wr.week_start THEN fd.feature END) AS flags_older_than_week
                FROM week_ranges wr
                    JOIN feature_data fd ON fd.lifecycle_time < wr.week_end
                GROUP BY wr.id, wr.created_at, fd.stage, fd.flag_type, fd.project
            )
            INSERT INTO lifecycle_trends (
                id,
                stage,
                flag_type,
                project,
                flags_older_than_week,
                new_flags_this_week,
                created_at
            )
            SELECT
                id,
                stage,
                flag_type,
                project,
                flags_older_than_week,
                new_flags_this_week,
                created_at
            FROM weekly_counts
            ORDER BY id, project, flag_type, stage;
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
