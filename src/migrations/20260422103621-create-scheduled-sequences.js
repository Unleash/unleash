'use strict';

exports.up = function (db, cb) {
    db.runSql(
        `
        CREATE TABLE IF NOT EXISTS scheduled_sequences (
            id TEXT PRIMARY KEY,
            project TEXT NOT NULL,
            environment TEXT NOT NULL,
            created_by_user_id INTEGER,
            created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            prompt TEXT,
            model TEXT,
            agent_version TEXT,
            status TEXT NOT NULL DEFAULT 'active'
                CHECK (status IN ('active', 'cancelled', 'completed', 'conflicted'))
        );

        CREATE INDEX IF NOT EXISTS scheduled_sequences_project_env_idx
            ON scheduled_sequences (project, environment);

        CREATE TABLE IF NOT EXISTS scheduled_actions (
            id TEXT PRIMARY KEY,
            sequence_id TEXT NOT NULL REFERENCES scheduled_sequences (id) ON DELETE CASCADE,
            feature_name TEXT NOT NULL,
            fire_at TIMESTAMP WITH TIME ZONE NOT NULL,
            action_type TEXT NOT NULL
                CHECK (action_type IN (
                    'strategy.create',
                    'strategy.update',
                    'strategy.delete',
                    'feature_environment.setEnabled'
                )),
            payload JSONB NOT NULL,
            owned_strategy_id TEXT,
            status TEXT NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending', 'executed', 'failed', 'skipped')),
            executed_at TIMESTAMP WITH TIME ZONE,
            error TEXT,
            sort_order INTEGER NOT NULL
        );

        CREATE INDEX IF NOT EXISTS scheduled_actions_due_idx
            ON scheduled_actions (status, fire_at)
            WHERE status = 'pending';

        CREATE INDEX IF NOT EXISTS scheduled_actions_sequence_sort_idx
            ON scheduled_actions (sequence_id, sort_order);
        `,
        cb,
    );
};

exports.down = function (db, cb) {
    db.runSql(
        `
        DROP TABLE IF EXISTS scheduled_actions;
        DROP TABLE IF EXISTS scheduled_sequences;
        `,
        cb,
    );
};
