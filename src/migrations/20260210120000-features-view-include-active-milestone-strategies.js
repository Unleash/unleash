'use strict';

exports.up = function (db, callback) {
    db.runSql(
        `
          DROP VIEW features_view;

          CREATE VIEW features_view AS
          SELECT
              features.name as name,
              features.description as description,
              features.type as type,
              features.project as project,
              features.stale as stale,
              features.impression_data as impression_data,
              features.created_at as created_at,
              features.archived_at as archived_at,
              features.last_seen_at as last_seen_at,
              feature_environments.last_seen_at as env_last_seen_at,
              feature_environments.enabled as enabled,
              feature_environments.environment as environment,
              feature_environments.variants as variants,
              environments.name as environment_name,
              environments.type as environment_type,
              environments.sort_order as environment_sort_order,
              feature_strategies.id as strategy_id,
              feature_strategies.strategy_name as strategy_name,
              feature_strategies.parameters as parameters,
              feature_strategies.constraints as constraints,
              feature_strategies.sort_order as sort_order,
              fss.segment_id as segments,
              feature_strategies.title as strategy_title,
              feature_strategies.disabled as strategy_disabled,
              feature_strategies.variants as strategy_variants,
              users.id as user_id,
              users.name as user_name,
              users.username as user_username,
              users.email as user_email
          FROM
              features
                  LEFT JOIN feature_environments ON feature_environments.feature_name = features.name
                  LEFT JOIN (
                      SELECT fs.*
                      FROM feature_strategies fs
                      LEFT JOIN milestones m ON m.id = fs.milestone_id
                      LEFT JOIN release_plan_definitions rpd
                          ON rpd.id = m.release_plan_definition_id AND rpd.discriminator = 'plan'
                      WHERE fs.milestone_id IS NULL OR fs.milestone_id = rpd.active_milestone_id
                  ) AS feature_strategies ON feature_strategies.feature_name = feature_environments.feature_name
                  and feature_strategies.environment = feature_environments.environment
                  LEFT JOIN environments ON feature_environments.environment = environments.name
                  LEFT JOIN feature_strategy_segment as fss ON fss.feature_strategy_id = feature_strategies.id
                  LEFT JOIN users ON users.id = features.created_by_user_id;
        `,
        callback,
    );
};

exports.down = function (db, callback) {
    db.runSql(
        `
          DROP VIEW features_view;

          CREATE VIEW features_view AS
          SELECT
              features.name as name,
              features.description as description,
              features.type as type,
              features.project as project,
              features.stale as stale,
              features.impression_data as impression_data,
              features.created_at as created_at,
              features.archived_at as archived_at,
              features.last_seen_at as last_seen_at,
              feature_environments.last_seen_at as env_last_seen_at,
              feature_environments.enabled as enabled,
              feature_environments.environment as environment,
              feature_environments.variants as variants,
              environments.name as environment_name,
              environments.type as environment_type,
              environments.sort_order as environment_sort_order,
              feature_strategies.id as strategy_id,
              feature_strategies.strategy_name as strategy_name,
              feature_strategies.parameters as parameters,
              feature_strategies.constraints as constraints,
              feature_strategies.sort_order as sort_order,
              fss.segment_id as segments,
              feature_strategies.title as strategy_title,
              feature_strategies.disabled as strategy_disabled,
              feature_strategies.variants as strategy_variants,
              users.id as user_id,
              users.name as user_name,
              users.username as user_username,
              users.email as user_email
          FROM
              features
                  LEFT JOIN feature_environments ON feature_environments.feature_name = features.name
                  LEFT JOIN (
                      SELECT *
                      FROM feature_strategies
                      WHERE milestone_id IS NULL
                  ) AS feature_strategies ON feature_strategies.feature_name = feature_environments.feature_name
                  and feature_strategies.environment = feature_environments.environment
                  LEFT JOIN environments ON feature_environments.environment = environments.name
                  LEFT JOIN feature_strategy_segment as fss ON fss.feature_strategy_id = feature_strategies.id
                  LEFT JOIN users ON users.id = features.created_by_user_id;
        `,
        callback,
    );
};
