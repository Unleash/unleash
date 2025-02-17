exports.up = function (db, cb) {
    db.runSql(
        `CREATE UNIQUE INDEX idx_uniq_release_plan_definitions_discriminator_template
         ON release_plan_definitions(name)
         WHERE discriminator = 'template'`,
        cb,
    );
};

exports.down = function (db, cb) {
    db.runSql(
        `DROP INDEX IF EXISTS idx_uniq_release_plan_definitions_discriminator_template`,
        cb,
    );
};
