
exports.up = (db, callback) => {
    db.runSql(
        `
        ALTER TABLE users ADD COLUMN updated_at timestamptz NOT NULL DEFAULT now();

        -- Backfill existing rows using max(created_at, deleted_at)
        UPDATE users
        SET updated_at = COALESCE(
                   GREATEST(created_at, deleted_at),
                   created_at,
                   now()
                 );

        CREATE OR REPLACE FUNCTION set_users_updated_at()
        RETURNS trigger AS $unleash_user_updated_at_fn$
        BEGIN
            NEW.updated_at := now();
            RETURN NEW;
        END;
        $unleash_user_updated_at_fn$ LANGUAGE plpgsql;

        CREATE TRIGGER trg_set_users_updated_at
        BEFORE UPDATE ON users
        FOR EACH ROW
        EXECUTE FUNCTION set_users_updated_at();

        -- create an index only for non-system and non-service users
        CREATE INDEX idx_users_only_updated_at_desc ON users (updated_at DESC) 
        WHERE is_system = false AND is_service = false;
        `,
        callback,
    );
};

exports.down = (db, callback) => {
    db.runSql(
        `
        DROP INDEX IF EXISTS idx_users_only_updated_at_desc;
        DROP TRIGGER IF EXISTS trg_set_users_updated_at ON users;
        DROP FUNCTION IF EXISTS set_users_updated_at();
        ALTER TABLE users DROP COLUMN IF EXISTS updated_at;
        `,
        callback,
    );
};
