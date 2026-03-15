exports.up = function (db, cb) {
    db.runSql(
        `
        ALTER TABLE unleash_session
            ADD COLUMN IF NOT EXISTS id UUID NOT NULL DEFAULT gen_random_uuid();

        UPDATE unleash_session SET id = gen_random_uuid() WHERE id IS NULL;

        CREATE UNIQUE INDEX IF NOT EXISTS unleash_session_id_idx ON unleash_session (id);
        `,
        cb,
    );
};

exports.down = function (db, cb) {
    db.runSql(
        `
        DROP INDEX IF EXISTS unleash_session_id_idx;
        ALTER TABLE unleash_session DROP COLUMN IF EXISTS id;
        `,
        cb,
    );
};
