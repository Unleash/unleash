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
                    SELECT date_trunc('day', now() AT TIME ZONE 'UTC') AS today
                ) AS t
                CROSS JOIN LATERAL (
                    SELECT generate_series(
                    t.today - ((extract(dow from t.today)::int + 7) % 7) * INTERVAL '1 day' - INTERVAL '52 weeks',
                    t.today - ((extract(dow from t.today)::int + 7) % 7) * INTERVAL '1 day' - INTERVAL '1 week',
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
                    JOIN feature_types ft ON ft.id = f.type
            ),
            latest_stage_on_week AS (
                SELECT DISTINCT ON (fl.feature, wr.id)
                    wr.id AS week_id,
                    fl.feature,
                    fl.stage AS stage_on_week,
                    fl.created_at
                FROM week_ranges wr
                    JOIN feature_lifecycles fl ON fl.created_at <= wr.week_end
                ORDER BY wr.id, fl.feature, fl.created_at DESC
            ),
            weekly_counts AS (
                SELECT
                    wr.id,
                    wr.created_at,
                    fd.stage,
                    fd.flag_type,
                    fd.project,
                    COUNT(DISTINCT CASE WHEN fd.lifecycle_time >= wr.week_start AND fd.lifecycle_time < wr.week_end THEN fd.feature END) AS new_flags_this_week,
                    COUNT(DISTINCT CASE WHEN fd.lifecycle_time < wr.week_start
                        AND lsbw.feature IS NOT NULL
                        AND lsbw.stage_on_week = fd.stage
                            THEN fd.feature
                        END) AS flags_older_than_week
                FROM week_ranges wr
                    JOIN feature_data fd ON fd.lifecycle_time < wr.week_end
                    LEFT JOIN latest_stage_on_week lsbw ON lsbw.feature = fd.feature AND lsbw.week_id = wr.id
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
