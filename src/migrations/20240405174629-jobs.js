exports.up = function (db, cb) {
    db.runSql(
        `
-- this function rounds a date to the nearest interval
CREATE OR REPLACE FUNCTION date_floor_round(base_date timestamptz, round_interval interval) RETURNS timestamptz AS $BODY$
SELECT to_timestamp(
    (EXTRACT(epoch FROM $1)::integer / EXTRACT(epoch FROM $2)::integer)
    * EXTRACT(epoch FROM $2)::integer
)
$BODY$ LANGUAGE SQL STABLE;

CREATE TABLE IF NOT EXISTS jobs (
    name TEXT NOT NULL,
    bucket TIMESTAMPTZ NOT NULL,
    stage TEXT NOT NULL,
    finished_at TIMESTAMPTZ,
    PRIMARY KEY (name, bucket)
);

CREATE INDEX IF NOT EXISTS idx_job_finished ON jobs(finished_at);
CREATE INDEX IF NOT EXISTS idx_job_stage ON jobs(stage);
        `,
        cb,
    );
};

exports.down = function (db, cb) {
    db.runSql(
        `
            DROP INDEX IF EXISTS idx_job_finished;
            DROP INDEX IF EXISTS idx_job_stage;
            DROP TABLE IF EXISTS jobs;
            
        `,
        cb,
    );
};
