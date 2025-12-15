exports.up = function (db, cb) {
    db.runSql(
        `ALTER TABLE context_fields ADD COLUMN project varchar(255) REFERENCES projects(id) ON DELETE CASCADE;`,
        cb,
    );
};

exports.down = function (db, cb) {
    db.runSql(
        `ALTER TABLE context_fields DROP COLUMN IF EXISTS project;`,
        cb,
    );
};
