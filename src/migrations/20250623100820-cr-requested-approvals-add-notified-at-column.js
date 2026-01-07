exports.up = function(db, cb) {
  db.runSql(`ALTER TABLE change_request_requested_approvers ADD COLUMN notified_at TIMESTAMP WITH TIME ZONE;
             CREATE INDEX IF NOT EXISTS cr_req_approvers_notified_at_idx ON change_request_requested_approvers(notified_at);`, cb);
};

exports.down = function(db, cb) {
  db.runSql(`
DROP INDEX IF EXISTS cr_req_approvers_notified_at_idx;
ALTER TABLE change_request_requested_approvers DROP COLUMN notified_at;`, cb);
};
