'use strict';

exports.up = (db, cb) => {
    db.runSql(
        `
        ALTER TABLE scheduled_actions
            DROP CONSTRAINT IF EXISTS scheduled_actions_action_type_check;
        ALTER TABLE scheduled_actions
            ADD CONSTRAINT scheduled_actions_action_type_check
            CHECK (action_type IN (
                'strategy.create',
                'strategy.update',
                'strategy.delete',
                'feature_environment.setEnabled',
                'mcp.invoke'
            ));
        `,
        cb,
    );
};

exports.down = (db, cb) => {
    db.runSql(
        `
        DELETE FROM scheduled_actions WHERE action_type = 'mcp.invoke';
        ALTER TABLE scheduled_actions
            DROP CONSTRAINT IF EXISTS scheduled_actions_action_type_check;
        ALTER TABLE scheduled_actions
            ADD CONSTRAINT scheduled_actions_action_type_check
            CHECK (action_type IN (
                'strategy.create',
                'strategy.update',
                'strategy.delete',
                'feature_environment.setEnabled'
            ));
        `,
        cb,
    );
};
