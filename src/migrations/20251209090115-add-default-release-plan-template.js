'use strict';

const TEMPLATE_NAME = 'Unleash Release Template';
const TEMPLATE_ID = '01KC6TD3HASJWRPMKT1ACY8M3A';

exports.up = function (db, callback) {
    const milestoneIds = ['01KC6VHE9VYKDN12C5VASZ5GQY', '01KC6VHE9VB6YX6B3QVJ6J8M7D', '01KC6VHE9V0JFJSTHY5AYMSF0G', '01KC6VHE9VJSFWF0RJDYCVMWBC'];
    const strategyIds = ['01KC6VJDDYAYBRCZT92YFF1H5Q', '01KC6VJDDYMA9W74KJ4TJ9EEK6', '01KC6VJDDYD4VX407YX4QA3AVJ', '01KC6VJDDYVR43TJTWY1BZ2SYF'];

    db.runSql(
        `
        INSERT INTO release_plan_definitions (id, discriminator, name, description, created_by_user_id)
        SELECT '${TEMPLATE_ID}', 'template', '${TEMPLATE_NAME}',
               'A built-in progressive rollout template with 25%, 50%, 75%, and 100% milestones.',
               -1337
        WHERE NOT EXISTS (
            SELECT 1 FROM release_plan_definitions
            WHERE discriminator = 'template'
        );

        INSERT INTO milestones (id, name, sort_order, release_plan_definition_id)
        SELECT v.id, v.name, v.sort_order, '${TEMPLATE_ID}'
        FROM (VALUES
            ('${milestoneIds[0]}', 'Rollout 25%', 0),
            ('${milestoneIds[1]}', 'Rollout 50%', 1),
            ('${milestoneIds[2]}', 'Rollout 75%', 2),
            ('${milestoneIds[3]}', 'Rollout 100%', 3)
        ) AS v(id, name, sort_order)
        WHERE EXISTS (
            SELECT 1 FROM release_plan_definitions WHERE id = '${TEMPLATE_ID}'
        );

        INSERT INTO milestone_strategies (id, milestone_id, sort_order, title, strategy_name, parameters, constraints)
        SELECT v.strategy_id, v.milestone_id, 0, '', 'flexibleRollout', v.params::jsonb, '[]'::jsonb
        FROM (VALUES
            ('${strategyIds[0]}', '${milestoneIds[0]}', '{"rollout":"25","stickiness":"default","groupId":"{{featureName}}"}'),
            ('${strategyIds[1]}', '${milestoneIds[1]}', '{"rollout":"50","stickiness":"default","groupId":"{{featureName}}"}'),
            ('${strategyIds[2]}', '${milestoneIds[2]}', '{"rollout":"75","stickiness":"default","groupId":"{{featureName}}"}'),
            ('${strategyIds[3]}', '${milestoneIds[3]}', '{"rollout":"100","stickiness":"default","groupId":"{{featureName}}"}')
        ) AS v(strategy_id, milestone_id, params)
        WHERE EXISTS (
            SELECT 1 FROM milestones WHERE id = v.milestone_id
        );
        `,
        callback,
    );
};

exports.down = function (db, callback) {
    db.runSql(
        `DELETE FROM release_plan_definitions WHERE id = '${TEMPLATE_ID}'`,
        callback,
    );
};
