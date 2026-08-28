exports.up = function (db, cb) {
    db.runSql(
        `ALTER TABLE release_plan_definitions ADD COLUMN project varchar(255) REFERENCES projects(id) ON DELETE CASCADE;`,
        cb,
    );
};

exports.down = function (db, cb) {
    db.runSql(
        `ALTER TABLE release_plan_definitions DROP COLUMN IF EXISTS project;`,
        cb,
    );
};
