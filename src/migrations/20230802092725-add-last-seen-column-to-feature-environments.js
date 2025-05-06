'use strict';

exports.up = function (db, callback) {
    db.runSql(
        `
          ALTER TABLE feature_environments ADD COLUMN IF NOT EXISTS last_seen_at timestamp with time zone;

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
              feature_environments.last_seen_at as last_seen_at,
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
              feature_strategies.variants as strategy_variants
          FROM
              features
                  LEFT JOIN feature_environments ON feature_environments.feature_name = features.name
                  LEFT JOIN feature_strategies ON feature_strategies.feature_name = feature_environments.feature_name
                  and feature_strategies.environment = feature_environments.environment
                  LEFT JOIN environments ON feature_environments.environment = environments.name
                  LEFT JOIN feature_strategy_segment as fss ON fss.feature_strategy_id = feature_strategies.id;
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
              feature_strategies.variants as strategy_variants
          FROM
              features
                  LEFT JOIN feature_environments ON feature_environments.feature_name = features.name
                  LEFT JOIN feature_strategies ON feature_strategies.feature_name = feature_environments.feature_name
                  and feature_strategies.environment = feature_environments.environment
                  LEFT JOIN environments ON feature_environments.environment = environments.name
                  LEFT JOIN feature_strategy_segment as fss ON fss.feature_strategy_id = feature_strategies.id;

          ALTER TABLE feature_environments DROP COLUMN IF EXISTS last_seen_at;
        `,
        callback,
    );
};
