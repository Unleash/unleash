exports.up = function(db, cb) {
    db.runSql(
        `
        ALTER TABLE stat_edge_observability
        ADD COLUMN hosting TEXT;
        `,
        cb,
    );
};

exports.down = function(db, cb) {
    db.runSql(
        `
        ALTER TABLE stat_edge_observability
        DROP COLUMN IF EXISTS hosting;
        `,
        cb,
    );
};
