exports.up = function(db, cb) {
  db.runSql(`
    select u.id, u.username, u.email 
    from users u 
    where is_system = false and 
          is_service = false and 
          deleted_at is NULL and 
          email is not null and 
          NOT EXISTS (select * from events 
                      where type = 'user-created' and 
                      (data ->> 'id')::int = u.id limit 1);
  `, (err, results) => {
    if (err) return cb(err);

    const userIds = results.rows.map(row => row.id);
    if (userIds.length === 0) {
      return cb();
    }

    const values = results.rows.map(row => `('unleash_system_user', 'user-created', '{"id": "${row.id}", "email": "${row.email}"}', true)`).join(', ');

    console.log(`Inserting ${userIds.length} user-created events for users: ${userIds.join(', ')}`);
    db.runSql(`
      INSERT INTO events (created_by, type, data, announced)
      VALUES ${values}
      ON CONFLICT DO NOTHING;
    `, cb);
  });
};

exports.down = function(db, cb) {
  cb();
  // No down migration needed as this is a data backfill.
};
