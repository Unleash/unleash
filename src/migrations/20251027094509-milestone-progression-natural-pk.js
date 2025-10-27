exports.up = function(db, cb) {
    db.runSql(
        `
        DROP INDEX IF EXISTS milestone_progressions_source_milestone_idx;

        ALTER TABLE milestone_progressions DROP COLUMN id;

        ALTER TABLE milestone_progressions ADD PRIMARY KEY (source_milestone);
        `,
        cb,
    );
};

exports.down = function(db, cb) {
    db.runSql(
        `
        ALTER TABLE milestone_progressions DROP CONSTRAINT milestone_progressions_pkey;

        ALTER TABLE milestone_progressions ADD COLUMN id TEXT NOT NULL DEFAULT gen_random_uuid()::text;

        ALTER TABLE milestone_progressions ADD PRIMARY KEY (id);

        CREATE UNIQUE INDEX milestone_progressions_source_milestone_idx ON milestone_progressions(source_milestone);
        `,
        cb,
    );
};
