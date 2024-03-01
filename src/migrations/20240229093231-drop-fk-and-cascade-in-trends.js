exports.up = function (db, cb) {
    db.runSql(
        `
            ALTER TABLE flag_trends DROP CONSTRAINT IF EXISTS flag_trends_project_fkey;
            ALTER TABLE project_client_metrics_trends DROP CONSTRAINT IF EXISTS project_client_metrics_trends_project_fkey;
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
