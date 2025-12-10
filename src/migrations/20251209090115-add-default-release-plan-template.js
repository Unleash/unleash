'use strict';

const { ulid } = require('ulidx');

const TEMPLATE_NAME = 'Unleash Release Template';

exports.up = function (db, callback) {
    const templateId = ulid();
    const milestoneIds = [ulid(), ulid(), ulid(), ulid()];
    const strategyIds = [ulid(), ulid(), ulid(), ulid()];

    db.runSql(
        `
        INSERT INTO release_plan_definitions (id, discriminator, name, description, created_by_user_id)
        SELECT '${templateId}', 'template', '${TEMPLATE_NAME}',
               'A standard progressive rollout template with 25%, 50%, 75%, and 100% milestones.',
               -1337
        WHERE NOT EXISTS (
            SELECT 1 FROM release_plan_definitions
            WHERE discriminator = 'template' AND name = '${TEMPLATE_NAME}'
        );

        INSERT INTO milestones (id, name, sort_order, release_plan_definition_id)
        SELECT v.id, v.name, v.sort_order, rpd.id
        FROM (VALUES
            ('${milestoneIds[0]}', 'Rollout 25%', 0),
            ('${milestoneIds[1]}', 'Rollout 50%', 1),
            ('${milestoneIds[2]}', 'Rollout 75%', 2),
            ('${milestoneIds[3]}', 'Rollout 100%', 3)
        ) AS v(id, name, sort_order)
        CROSS JOIN release_plan_definitions rpd
        WHERE rpd.discriminator = 'template' AND rpd.name = '${TEMPLATE_NAME}'
        AND NOT EXISTS (
            SELECT 1 FROM milestones m WHERE m.release_plan_definition_id = rpd.id
        );

        INSERT INTO milestone_strategies (id, milestone_id, sort_order, title, strategy_name, parameters, constraints)
        SELECT v.strategy_id, m.id, 0, '', 'flexibleRollout', v.params::jsonb, '[]'::jsonb
        FROM (VALUES
            ('${strategyIds[0]}', 'Rollout 25%', '{"rollout":"25","stickiness":"default","groupId":"{{featureName}}"}'),
            ('${strategyIds[1]}', 'Rollout 50%', '{"rollout":"50","stickiness":"default","groupId":"{{featureName}}"}'),
            ('${strategyIds[2]}', 'Rollout 75%', '{"rollout":"75","stickiness":"default","groupId":"{{featureName}}"}'),
            ('${strategyIds[3]}', 'Rollout 100%', '{"rollout":"100","stickiness":"default","groupId":"{{featureName}}"}')
        ) AS v(strategy_id, milestone_name, params)
        JOIN release_plan_definitions rpd ON rpd.discriminator = 'template' AND rpd.name = '${TEMPLATE_NAME}'
        JOIN milestones m ON m.release_plan_definition_id = rpd.id AND m.name = v.milestone_name
        WHERE NOT EXISTS (
            SELECT 1 FROM milestone_strategies ms WHERE ms.milestone_id = m.id
        );
        `,
        callback,
    );
};

exports.down = function (db, callback) {
    db.runSql(
        `DELETE FROM release_plan_definitions
         WHERE discriminator = 'template' AND name = '${TEMPLATE_NAME}'`,
        callback,
    );
};
