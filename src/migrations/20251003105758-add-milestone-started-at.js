exports.up = function(db, cb) {
    db.runSql(
        `ALTER TABLE milestones ADD COLUMN IF NOT EXISTS started_at TIMESTAMP WITH TIME ZONE;`,
        cb,
    );
};

exports.down = function(db, cb) {
    db.runSql(
        `ALTER TABLE milestones DROP COLUMN IF EXISTS started_at;`,
        cb,
    );
};
