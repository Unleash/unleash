exports.up = function (db, cb) {
    db.runSql(
        `
            CREATE TABLE IF NOT EXISTS project_client_metrics_trends
            (
                project varchar NOT NULL references projects(id) ON DELETE CASCADE,
                date date NOT NULL,
                total_yes integer NOT NULL,
                total_no integer NOT NULL,
                total_apps integer NOT NULL,
                total_flags integer NOT NULL,
                total_environments integer NOT NULL,
                PRIMARY KEY (project, date)
            );
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
