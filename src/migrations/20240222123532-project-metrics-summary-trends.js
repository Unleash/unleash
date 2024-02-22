exports.up = function (db, cb) {
    db.runSql(
        `
            CREATE TABLE IF NOT EXISTS project_client_metrics_trends
            (
                project varchar NOT NULL,
                date date NOT NULL,
                total_yes integer NOT NULL,
                total_no integer NOT NULL,
                total_apps integer NOT NULL,
                total_flags integer NOT NULL,
                total_environments integer NOT NULL,
                PRIMARY KEY (project, date)
            );

            INSERT INTO project_client_metrics_trends (project, date, total_yes, total_no, total_apps, total_flags, total_environments)
            SELECT
                f.project,
                cmed.date,
                SUM(cmed.yes) AS total_yes,
                SUM(cmed.no) AS total_no,
                COUNT(DISTINCT cmed.app_name) AS total_apps,
                COUNT(DISTINCT cmed.feature_name) AS total_flags,
                COUNT(DISTINCT cmed.environment) AS total_environments
            FROM
                client_metrics_env_daily cmed
                    JOIN features f on f.name = cmed.feature_name
            GROUP BY
                f.project, cmed.date
        `,
        cb,
    );
};

exports.down = function (db, cb) {
    db.runSql(
        `
        DROP TABLE IF EXISTS project_client_metrics_trends
        `,
        cb,
    );
};
