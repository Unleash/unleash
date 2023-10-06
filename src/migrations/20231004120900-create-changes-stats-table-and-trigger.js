exports.up = function(db, cb) {
  db.runSql(`
    CREATE TABLE stat_environment_updates(
        day DATE NOT NULL,
        environment TEXT,
        updates BIGINT NOT NULL DEFAULT 0,
        PRIMARY KEY (day, environment)
    );

    CREATE FUNCTION unleash_update_stat_environment_changes_counter() RETURNS trigger AS $unleash_update_changes_counter$
        BEGIN
            IF NEW.environment IS NOT NULL THEN
                INSERT INTO stat_environment_updates(day, environment, updates) SELECT DATE_TRUNC('Day', NEW.created_at), NEW.environment, 1 ON CONFLICT (day, environment) DO UPDATE SET updates = EXCLUDED.updates + 1;
            END IF;

            return null;
        END;
    $unleash_update_changes_counter$ LANGUAGE plpgsql;

    CREATE TRIGGER unleash_update_stat_environment_changes
    BEFORE INSERT ON events
    FOR EACH ROW EXECUTE FUNCTION unleash_update_stat_environment_changes_counter();
  `, cb);
};

exports.down = function(db, cb) {
  db.runSql(`
    DROP TRIGGER IF EXISTS unleash_update_stat_environment_changes ON events;
    DROP FUNCTION IF EXISTS unleash_update_stat_environment_changes_counter;
    DROP TABLE IF EXISTS stat_environment_updates;
  `, cb);
};
