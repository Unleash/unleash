exports.up = function (db, cb) {
    db.runSql(
        `ALTER TABLE milestone_strategies ADD COLUMN IF NOT EXISTS disabled BOOLEAN DEFAULT false;`,
        cb,
    );
};

exports.down = function (db, cb) {
    db.runSql(
        `ALTER TABLE milestone_strategies DROP COLUMN IF EXISTS disabled;`,
        cb,
    );
};
