exports.up = function (db, cb) {
    db.runSql(
        `ALTER TABLE segments ADD COLUMN IF NOT EXISTS segment_project_id VARCHAR(255);`,
        cb,
    );
    cb();
};

exports.down = function (db, cb) {
    cb();
};
