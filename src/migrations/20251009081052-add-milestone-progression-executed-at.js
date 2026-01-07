exports.up = function(db, cb) {
    db.runSql(
        `
        ALTER TABLE milestone_progressions
        ADD COLUMN executed_at TIMESTAMP WITH TIME ZONE;
        `,
        cb,
    );
};

exports.down = function(db, cb) {
    db.runSql(
        `
        ALTER TABLE milestone_progressions
        DROP COLUMN IF EXISTS executed_at;
        `,
        cb,
    );
};
