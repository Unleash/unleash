exports.up = function(db, cb) {
    db.runSql(
        `
        CREATE TABLE IF NOT EXISTS milestone_progressions (
            id TEXT PRIMARY KEY NOT NULL,
            source_milestone TEXT NOT NULL REFERENCES milestones(id) ON DELETE CASCADE,
            target_milestone TEXT NOT NULL REFERENCES milestones(id) ON DELETE CASCADE,
            transition_condition JSONB NOT NULL
        );
        `,
        cb,
    );
};

exports.down = function(db, cb) {
    db.runSql(
        `DROP TABLE IF EXISTS milestone_progressions;`,
        cb,
    );
};
