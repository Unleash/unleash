exports.up = function (db, cb) {
    db.runSql(
        `
        CREATE INDEX feature_environments_feature_name_idx ON feature_environments(feature_name);
        CREATE INDEX feature_strategies_environment_idx ON feature_strategies(environment);
        CREATE INDEX feature_strategies_feature_name_idx ON feature_strategies(feature_name);
        CREATE INDEX feature_tag_tag_type_and_value_idx ON feature_tag(tag_type, tag_value);
        CREATE INDEX project_environments_environment_idx ON project_environments(environment_name);
        CREATE INDEX reset_tokens_user_id_idx ON reset_tokens(user_id);
        CREATE INDEX role_permission_role_id_idx ON role_permission(role_id);
        CREATE INDEX role_user_user_id_idx ON role_user(user_id);

    `,
        cb,
    );
};

exports.down = function (db, cb) {
    db.runSql(
        `
    DROP INDEX feature_environments_feature_name_idx;
    DROP INDEX feature_strategies_environment_idx;
    DROP INDEX feature_strategies_feature_name_idx;
    DROP INDEX feature_tag_tag_type_and_value_idx;
    DROP INDEX project_environments_environment_idx;
    DROP INDEX reset_tokens_user_id_idx;
    DROP INDEX role_permission_role_id_idx;
    DROP INDEX role_user_user_id_idx;

    `,
        cb,
    );
};

exports._meta = {
    version: 1,
};
