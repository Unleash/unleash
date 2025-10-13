exports.up = function(db, cb) {
    db.runSql(
        `
        ALTER TABLE milestone_progressions
        ADD CONSTRAINT milestone_progressions_source_milestone_unique
        UNIQUE (source_milestone);
        `,
        cb,
    );
};

exports.down = function(db, cb) {
    db.runSql(
        `
        ALTER TABLE milestone_progressions
        DROP CONSTRAINT IF EXISTS milestone_progressions_source_milestone_unique;
        `,
        cb,
    );
};
