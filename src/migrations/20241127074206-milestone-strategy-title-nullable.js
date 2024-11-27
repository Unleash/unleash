exports.up = function(db, cb) {
    db.runSql(
        `
        ALTER TABLE milestone_strategies ALTER COLUMN title DROP NOT NULL;
        `,
        cb,
    );
};

exports.down = function(db, cb) {
    cb();
};