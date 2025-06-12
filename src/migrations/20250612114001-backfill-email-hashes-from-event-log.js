exports.up = function(db, cb) {
  db.runSql(`
    WITH deleted_users AS (
        SELECT (pre_data ->> 'id' AS user_id,
                pre_data ->> 'email' AS email)
        FROM events
        WHERE type = 'user-deleted'
        AND created_at >= now() - interval '30 days'
    );
    UPDATE users u
    SET email_hash = encode(sha256(du.email), 'hex')
    FROM deleted_users du
    WHERE u.id = du.id AND email_hash IS NULL
  `, cb);
};

exports.down = function(db, cb) {
  cb();
};
