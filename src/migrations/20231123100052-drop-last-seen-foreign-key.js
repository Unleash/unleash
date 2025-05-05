export async function up(db, cb) {
  db.runSql(
    `
    ALTER TABLE last_seen_at_metrics DROP CONSTRAINT last_seen_at_metrics_environment_fkey;
    `,
    cb
  );
};

export async function down(db, cb) {
  db.runSql(
    `
    ALTER TABLE last_seen_at_metrics ADD CONSTRAINT last_seen_at_metrics_environment_fkey FOREIGN KEY (environment) REFERENCES environments(name);
    `,
    cb
  );
};