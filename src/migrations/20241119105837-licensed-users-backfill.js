exports.up = (db, cb) => {
  db.runSql(`
      WITH user_events AS (
          SELECT
              DISTINCT CASE WHEN type = 'user-deleted' THEN pre_data ->> 'email' ELSE data ->> 'email' END AS email,
                       type,
                       created_at AS event_date
          FROM
              events
          WHERE
              type IN ('user-created', 'user-deleted')
      ),
           dates AS (
               WITH RECURSIVE generated_dates AS (
                   SELECT
                       MIN(event_date):: timestamp AS date
                   FROM
                       user_events
                   UNION ALL
                   SELECT
                       date + INTERVAL '1 day'
                   FROM
                       generated_dates
                   WHERE
                       date + INTERVAL '1 day' <= CURRENT_DATE
               )
               SELECT
                   date :: date
               FROM
                   generated_dates
           ),
           active_emails AS (
               SELECT
                   d.date,
                   ue.email,
                   MAX(
                       CASE WHEN ue.type = 'user-created' THEN ue.event_date ELSE NULL END
                   ) AS created_date,
                   MAX(
                       CASE WHEN ue.type = 'user-deleted' THEN ue.event_date ELSE NULL END
                   ) AS deleted_date
               FROM
                   dates d
                       LEFT JOIN user_events ue ON ue.event_date <= d.date
               GROUP BY
                   d.date,
                   ue.email
           ),
           result AS (
               SELECT
                   d.date,
                   COUNT(DISTINCT ae.email) AS active_emails_count
               FROM
                   dates d
                       LEFT JOIN active_emails ae ON d.date = ae.date
               WHERE
                   (
                       ae.deleted_date IS NULL
                           OR ae.deleted_date >= ae.date - INTERVAL '30 days'
                           OR ae.deleted_date < ae.created_date
                       )
               GROUP BY
                   d.date
               ORDER BY
                   d.date
           ) INSERT INTO licensed_users (date, count)
      SELECT
          date,
          active_emails_count
      FROM
          result ON CONFLICT (date) DO NOTHING;
  `, cb);

};

exports.down = (db, cb) => {
  db.runSql(``, cb);
};

