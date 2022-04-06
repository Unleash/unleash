exports.up = function (db, cb) {
    db.runSql('ALTER TABLE roles DROP COLUMN IF EXISTS project', cb);
};

exports.down = function (db, cb) {
    db.runSql('ALTER TABLE roles ADD COLUMN IF NOT EXISTS project text', cb);
};
