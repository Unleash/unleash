exports.up = function(db, cb) {
    db.runSql(`ALTER TABLE client_metrics_env_variants_daily ALTER COLUMN count TYPE BIGINT`, cb);
};

exports.down = function(db, cb) {
    db.runSql(`ALTER TABLE client_metrics_env_variants_daily ALTER COLUMN count TYPE INT`, cb);
};
