exports.up = function(db, cb) {
  db.runSql(`CREATE TABLE change_request_requested_approvers(
    change_request_id INTEGER REFERENCES change_requests(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT (now() at time zone 'utc'),
    PRIMARY KEY (change_request_id, user_id)
  );
  CREATE INDEX IF NOT EXISTS change_request_requested_approvers_cr_id_idx ON change_request_requested_approvers(change_request_id);
  CREATE INDEX IF NOT EXISTS change_request_requested_approvers_user_id_idx ON change_request_requested_approvers(user_id);
  `, cb)
};

exports.down = function(db, cb) {
  db.runSql(`DROP TABLE IF EXISTS change_request_requested_approvers`, cb);
};

exports._meta = {
  "version": 1
};
