'use strict';

exports.up = function (db, cb) {
    db.runSql(
        `
        CREATE TABLE IF NOT EXISTS feature_environments_metrics(
           environment  varchar(100) not null
               references environments(name)
                   ON DELETE CASCADE,
           feature_name varchar(255) not null
               references features(name)
                   ON DELETE CASCADE,
           last_seen_at timestamp with time zone,
           PRIMARY KEY (environment, feature_name)
        );

        INSERT INTO feature_environments_metrics (environment, feature_name, last_seen_at)
        SELECT
            feature_environments.environment,
            feature_environments.feature_name,
            feature_environments.last_seen_at
        FROM feature_environments
        ON CONFLICT (environment, feature_name)
            DO NOTHING;

        DROP VIEW features_view;

        CREATE VIEW features_view AS
        SELECT features.name                     as name,
               features.description              as description,
               features.type                     as type,
               features.project                  as project,
               features.stale                    as stale,
               features.impression_data          as impression_data,
               features.created_at               as created_at,
               features.archived_at              as archived_at,
               (
                   SELECT
                       CASE
                           WHEN COUNT(*) > 0 THEN MAX(last_seen_at)
                           END
                   FROM feature_environments_metrics
                   WHERE features.name = feature_environments_metrics.feature_name
               ) as last_seen_at,
               feature_environments_metrics.last_seen_at as env_last_seen_at,
               feature_environments.enabled      as enabled,
               feature_environments.environment  as environment,
               feature_environments.variants     as variants,
               environments.name                 as environment_name,
               environments.type                 as environment_type,
               environments.sort_order           as environment_sort_order,
               feature_strategies.id             as strategy_id,
               feature_strategies.strategy_name  as strategy_name,
               feature_strategies.parameters     as parameters,
               feature_strategies.constraints    as constraints,
               feature_strategies.sort_order     as sort_order,
               fss.segment_id                    as segments,
               feature_strategies.title          as strategy_title,
               feature_strategies.disabled       as strategy_disabled,
               feature_strategies.variants       as strategy_variants
        FROM features
                 LEFT JOIN feature_environments ON feature_environments.feature_name = features.name
                 LEFT JOIN feature_strategies ON feature_strategies.feature_name = feature_environments.feature_name
                   AND feature_strategies.environment = feature_environments.environment
                 LEFT JOIN feature_environments_metrics ON feature_environments_metrics.feature_name = feature_environments.feature_name
                   AND feature_environments_metrics.environment = feature_environments.environment
                 LEFT JOIN environments ON feature_environments.environment = environments.name
                 LEFT JOIN feature_strategy_segment as fss ON fss.feature_strategy_id = feature_strategies.id;
        `,
        cb(),
    );
};

exports.down = function (db, cb) {
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
            feature_strategies.variants as strategy_variants
         FROM
            features
                LEFT JOIN feature_environments ON feature_environments.feature_name = features.name
                LEFT JOIN feature_strategies ON feature_strategies.feature_name = feature_environments.feature_name
                and feature_strategies.environment = feature_environments.environment
                LEFT JOIN environments ON feature_environments.environment = environments.name
                LEFT JOIN feature_strategy_segment as fss ON fss.feature_strategy_id = feature_strategies.id;


         DROP TABLE IF EXISTS feature_environments_metrics;
        `,
        cb,
    );
};
