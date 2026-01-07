exports.up = function(db, cb) {
    db.runSql(
        `DROP INDEX IF EXISTS milestone_progressions_source_milestone_idx;
         CREATE UNIQUE INDEX milestone_progressions_source_milestone_idx ON milestone_progressions(source_milestone);`,
        cb,
    );
};

exports.down = function(db, cb) {
    db.runSql(
        `DROP INDEX IF EXISTS milestone_progressions_source_milestone_idx;`,
        cb,
    );
};
