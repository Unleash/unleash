'use strict';

exports.up = function (db, callback) {
    db.runSql(
        `
        -- delete deprecated strategies still present in v4
        delete from strategies
            where name in ('gradualRolloutUserId', 'gradualRolloutRandom', 'gradualRolloutSessionId')
            and deprecated
            and not exists (select * from feature_strategies where strategy_name = name limit 1);

        -- deprecate strategies on v5
        update strategies set deprecated = true where name in ('userWithId');

        -- update strategy descriptions and sort order
        update strategies set sort_order = 1, description = 'This strategy turns on / off for your entire userbase. Prefer using "Gradual rollout" strategy (100%=on, 0%=off).' WHERE name = 'default';
        update strategies set sort_order = 0 WHERE name = 'flexibleRollout';
        update strategies set description = 'Enable the feature for a specific set of userIds. Prefer using "Gradual rollout" strategy with user id constraints.' WHERE name = 'userWithId';
        `,
        callback,
    );
};

exports.down = function (db, callback) {
    db.runSql(
        `

-- restore deleted strategies
insert into strategies (name, description, parameters, deprecated, sort_order) values
   ('gradualRolloutRandom', 'Randomly activate the feature toggle. No stickiness.', '[
       {
       "name": "percentage",
    "type": "percentage",
    "description": "",
    "required": false
        }
              ]', true, 3),
   ('gradualRolloutSessionId', 'Gradually activate feature toggle. Stickiness based on session id.', '[
       {
       "name": "percentage",
        "type": "percentage",
        "description": "",
        "required": false
            },
           {
        "name": "groupId",
        "type": "string",
        "description": "Used to define a activation groups, which allows you to correlate across feature toggles.",
        "required": true
            }
              ]', true, 4),
       ('gradualRolloutUserId', 'Gradually activate feature toggle for logged in users. Stickiness based on user id.', '[
           {
           "name": "percentage",
            "type": "percentage",
            "description": "",
            "required": false
                },
               {
            "name": "groupId",
            "type": "string",
            "description": "Used to define a activation groups, which allows you to correlate across feature toggles.",
            "required": true
                }
                  ]', true, 5);

        -- revert sort order
        update strategies set sort_order = 0 WHERE name = 'default';
        update strategies set sort_order = 1 WHERE name = 'flexibleRollout';
        `,
        callback,
    );
};
