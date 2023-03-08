import {
    Addons,
    ApiTokenProject,
    ApiTokens,
    ChangeRequestApprovals,
    ChangeRequestComments,
    ChangeRequestEvents,
    ChangeRequestSettings,
    ChangeRequests,
    ClientApplications,
    ClientInstances,
    ClientMetricsEnv,
    ContextFields,
    Environments,
    Events,
    FavoriteFeatures,
    FavoriteProjects,
    FeatureEnvironments,
    FeatureStrategies,
    FeatureStrategySegment,
    FeatureTag,
    FeatureTypes,
    Features,
    GroupRole,
    GroupUser,
    Groups,
    Permissions,
    PersonalAccessTokens,
    ProjectEnvironments,
    ProjectStats,
    Projects,
    PublicSignupTokens,
    PublicSignupTokensUser,
    ResetTokens,
    RolePermission,
    RoleUser,
    Roles,
    Segments,
    Settings,
    Strategies,
    TagTypes,
    Tags,
    UnleashSession,
    UserFeedback,
    UserSplash,
    Users,
} from './db-types';

declare module 'knex/types/tables' {
    interface Tables {
        // This is same as specifying `knex<User>('users')`
        addons: Addons;
        api_token_project: ApiTokenProject;
        api_tokens: ApiTokens;
        change_request_approvals: ChangeRequestApprovals;
        change_request_comments: ChangeRequestComments;
        change_request_events: ChangeRequestEvents;
        change_request_settings: ChangeRequestSettings;
        change_requests: ChangeRequests;
        client_applications: ClientApplications;
        client_instances: ClientInstances;
        client_metrics_env: ClientMetricsEnv;
        context_fields: ContextFields;
        environments: Environments;
        events: Events;
        favorite_features: FavoriteFeatures;
        favorite_projects: FavoriteProjects;
        feature_environments: FeatureEnvironments;
        feature_strategies: FeatureStrategies;
        feature_strategy_segment: FeatureStrategySegment;
        feature_tag: FeatureTag;
        feature_types: FeatureTypes;
        features: Features;
        group_role: GroupRole;
        group_user: GroupUser;
        groups: Groups;
        permissions: Permissions;
        personal_access_tokens: PersonalAccessTokens;
        project_environments: ProjectEnvironments;
        project_stats: ProjectStats;
        projects: Projects;
        public_signup_tokens: PublicSignupTokens;
        public_signup_tokens_user: PublicSignupTokensUser;
        reset_tokens: ResetTokens;
        role_permissions: RolePermission;
        role_user: RoleUser;
        roles: Roles;
        segments: Segments;
        settings: Settings;
        strategies: Strategies;
        tag_types: TagTypes;
        tag: Tags;
        unleash_session: UnleashSession;
        user_feedback: UserFeedback;
        user_splash: UserSplash;
        users: Users;
    }
}
