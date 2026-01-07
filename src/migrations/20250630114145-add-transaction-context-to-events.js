exports.up = function(db, cb) {
  db.runSql(`
    ALTER TABLE events 
    ADD COLUMN IF NOT EXISTS group_type TEXT,
    ADD COLUMN IF NOT EXISTS group_id TEXT;
  `, cb);
};

exports.down = function(db, cb) {
  db.runSql(`
    ALTER TABLE events 
    DROP COLUMN IF EXISTS group_id,
    DROP COLUMN IF EXISTS group_type;
  `, cb);
}; 