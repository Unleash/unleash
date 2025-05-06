exports.up = function(db, cb) {
    db.runSql(`
        ALTER TABLE release_plan_definitions DROP CONSTRAINT release_plan_definitions_created_by_user_id_fkey;
        CREATE INDEX idx_release_plan_definitions_created_by_user_id ON release_plan_definitions (created_by_user_id);
    `, cb)
};

exports.down = function(db, cb) {
    db.runSql(`
        ALTER TABLE release_plan_definitions ADD CONSTRAINT release_plan_definitions_created_by_user_id_fkey FOREIGN KEY (created_by_user_id) REFERENCES users(id);
        DROP INDEX idx_release_plan_definitions_created_by_user_id;
    `, cb);
};
