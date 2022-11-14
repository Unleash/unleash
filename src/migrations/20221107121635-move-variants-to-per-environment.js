'use strict';

exports.up = function (db, callback) {
    db.runSql(
        `
            CREATE TABLE IF NOT EXISTS feature_environment_variant
            (
                feature_name TEXT NOT NULL REFERENCES features(name) ON DELETE CASCADE,
                environment TEXT NOT NULL REFERENCES environments(name) ON DELETE CASCADE,
                variants jsonb DEFAULT '[]'::jsonb NOT NULL,
                PRIMARY KEY(feature_name, environment)
            );

            INSERT INTO feature_environment_variant (
                SELECT feature_name, environment, variants
                FROM feature_environments AS fe
                JOIN features AS f
                    ON f.name = fe.feature_name
            ) ON CONFLICT (feature_name, environment) DO NOTHING;

            ALTER TABLE features DROP COLUMN "variants";

            CREATE VIEW features_view AS
            SELECT
                features.name as name,
                features.description as description,
                features.type as type,
                features.project as project,
                features.stale as stale,
                feature_environment_variant.variants as variants,
                features.impression_data as impression_data,
                features.created_at as created_at,
                features.last_seen_at as last_seen_at,
                features.archived_at as archived_at,
                feature_environments.enabled as enabled,
                feature_environments.environment as environment,
                environments.name as environment_name,
                environments.type as environment_type,
                environments.sort_order as environment_sort_order,
                feature_strategies.id as strategy_id,
                feature_strategies.strategy_name as strategy_name,
                feature_strategies.parameters as parameters,
                feature_strategies.constraints as constraints,
                feature_strategies.sort_order as sort_order
            FROM
                features
            LEFT JOIN feature_environments ON feature_environments.feature_name = features.name
            LEFT JOIN feature_environment_variant ON feature_environments.environment = feature_environment_variant.environment
            and feature_environments.feature_name = feature_environment_variant.feature_name
            LEFT JOIN feature_strategies ON feature_strategies.feature_name = feature_environments.feature_name
            and feature_strategies.environment = feature_environments.environment
            LEFT JOIN environments ON feature_environments.environment = environments.name;
        `,
        callback,
    );
};

exports.down = function (db, callback) {
    db.runSql(
        `
            ALTER TABLE features ALTER COLUMN "variants" SET DEFAULT '[]';
            DROP TABLE feature_environment_variant;
            DROP VIEW features_view;
        `,
        callback,
    );
};
