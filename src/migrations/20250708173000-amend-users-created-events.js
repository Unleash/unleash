exports.up = function(db, cb) {
  db.runSql(`
    INSERT INTO events (created_at, created_by, type, data, announced)
    SELECT
      u.created_at AS created_at,
      'unleash_system_user' AS created_by,
      'user-created' AS type,
      json_build_object(
        'id', u.id,
        'email', u.email
      )::jsonb AS data,
      true AS announced
    FROM users u
    WHERE
      is_system = false
      AND is_service = false
      AND deleted_at IS NULL
      AND email IS NOT NULL
      AND NOT EXISTS (
        SELECT 1 FROM events
        WHERE type = 'user-created'
          AND (data ->> 'id')::int = u.id
        LIMIT 1
      )
    ON CONFLICT DO NOTHING;
  `, (err, results) => {
    if (err) {
      console.log('Error inserting user-created events:', err);
      return cb(err);
    }
    console.log('Inserted user-created events:', results.results.);
    cb();
  });
};

exports.down = function(db, cb) {
  cb();
  // No down migration needed as this is a data backfill.
};
