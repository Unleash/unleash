exports.up = function (db, cb) {
    db.runSql(
        `
        CREATE TABLE IF NOT EXISTS jobs (
            id SERIAL PRIMARY KEY NOT NULL,
            name VARCHAR(255) NOT NULL,
            last_execution TIMESTAMP NOT NULL,
            checkpoint VARCHAR(255) NOT NULL,
            UNIQUE (name)
        );

        CREATE INDEX IF NOT EXISTS idx_job_names ON jobs(name);
        `,
        cb,
    );
};

exports.down = function (db, cb) {
    db.runSql(
        `
            DROP TABLE IF EXISTS jobs;
            DROP INDEX IF EXISTS idx_job_names;
        `,
        cb,
    );
};
