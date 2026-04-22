'use strict';

exports.up = function (db, cb) {
    db.runSql(
        `
        ALTER TABLE feature_strategies
            ADD COLUMN IF NOT EXISTS created_by_sequence_id TEXT
                REFERENCES scheduled_sequences (id) ON DELETE SET NULL;

        CREATE INDEX IF NOT EXISTS feature_strategies_created_by_sequence_idx
            ON feature_strategies (created_by_sequence_id)
            WHERE created_by_sequence_id IS NOT NULL;
        `,
        cb,
    );
};

exports.down = function (db, cb) {
    db.runSql(
        `
        DROP INDEX IF EXISTS feature_strategies_created_by_sequence_idx;
        ALTER TABLE feature_strategies
            DROP COLUMN IF EXISTS created_by_sequence_id;
        `,
        cb,
    );
};
