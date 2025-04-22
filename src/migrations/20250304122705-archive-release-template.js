exports.up = (db, cb) => {
    db.runSql(`
        ALTER TABLE release_plan_definitions ADD COLUMN archived_at TIMESTAMP WITH TIME ZONE;
    `, cb);
};

exports.down = (db, cb) => {
    db.runSql(`
        ALTER TABLE release_plan_definitions DROP COLUMN archived_at;
    `, cb);
};
