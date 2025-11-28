import type { ITag } from '../tags/index.js';

export const APPLICATION_CREATED = 'application-created' as const;

// feature event types
export const FEATURE_CREATED = 'feature-created' as const;
export const FEATURE_DELETED = 'feature-deleted' as const;
export const FEATURE_UPDATED = 'feature-updated' as const;
export const FEATURE_DEPENDENCY_ADDED = 'feature-dependency-added' as const;
export const FEATURE_DEPENDENCY_REMOVED = 'feature-dependency-removed' as const;
export const FEATURE_DEPENDENCIES_REMOVED =
    'feature-dependencies-removed' as const;
export const FEATURE_METADATA_UPDATED = 'feature-metadata-updated' as const;
export const FEATURE_VARIANTS_UPDATED = 'feature-variants-updated' as const;
export const FEATURE_ENVIRONMENT_VARIANTS_UPDATED =
    'feature-environment-variants-updated' as const;
export const FEATURE_PROJECT_CHANGE = 'feature-project-change' as const;
export const FEATURE_ARCHIVED = 'feature-archived' as const;
export const FEATURE_REVIVED = 'feature-revived' as const;
export const FEATURE_IMPORT = 'feature-import' as const;
export const FEATURE_LINK_ADDED = 'feature-link-added' as const;
export const FEATURE_LINK_REMOVED = 'feature-link-removed' as const;
export const FEATURE_LINK_UPDATED = 'feature-link-updated' as const;
export const FEATURE_TAGGED = 'feature-tagged' as const;
export const FEATURE_TAG_IMPORT = 'feature-tag-import' as const;
export const FEATURE_STRATEGY_UPDATE = 'feature-strategy-update' as const;
export const FEATURE_STRATEGY_ADD = 'feature-strategy-add' as const;
export const FEATURE_STRATEGY_REMOVE = 'feature-strategy-remove' as const;
export const DROP_FEATURE_TAGS = 'drop-feature-tags' as const;
export const FEATURE_UNTAGGED = 'feature-untagged' as const;
export const FEATURE_STALE_ON = 'feature-stale-on' as const;
export const FEATURE_COMPLETED = 'feature-completed' as const;
export const FEATURE_UNCOMPLETED = 'feature-uncompleted' as const;
export const FEATURE_STALE_OFF = 'feature-stale-off' as const;
export const DROP_FEATURES = 'drop-features' as const;
export const FEATURE_ENVIRONMENT_ENABLED =
    'feature-environment-enabled' as const;
export const FEATURE_ENVIRONMENT_DISABLED =
    'feature-environment-disabled' as const;
export const STRATEGY_ORDER_CHANGED = 'strategy-order-changed';
export const STRATEGY_CREATED = 'strategy-created' as const;
export const STRATEGY_DELETED = 'strategy-deleted' as const;
export const STRATEGY_DEPRECATED = 'strategy-deprecated' as const;
export const STRATEGY_REACTIVATED = 'strategy-reactivated' as const;
export const STRATEGY_UPDATED = 'strategy-updated' as const;
export const STRATEGY_IMPORT = 'strategy-import' as const;
export const DROP_STRATEGIES = 'drop-strategies' as const;
export const CONTEXT_FIELD_CREATED = 'context-field-created' as const;
export const CONTEXT_FIELD_UPDATED = 'context-field-updated' as const;
export const CONTEXT_FIELD_DELETED = 'context-field-deleted' as const;
export const PROJECT_ACCESS_ADDED = 'project-access-added' as const;
export const FEATURE_TYPE_UPDATED = 'feature-type-updated' as const;

export const PROJECT_ACCESS_USER_ROLES_UPDATED =
    'project-access-user-roles-updated';

export const PROJECT_ACCESS_GROUP_ROLES_UPDATED =
    'project-access-group-roles-updated';

export const PROJECT_ACCESS_UPDATED = 'project-access-updated' as const;

export const PROJECT_ACCESS_USER_ROLES_DELETED =
    'project-access-user-roles-deleted';

export const PROJECT_ACCESS_GROUP_ROLES_DELETED =
    'project-access-group-roles-deleted';

export const ROLE_CREATED = 'role-created';
export const ROLE_UPDATED = 'role-updated';
export const ROLE_DELETED = 'role-deleted';

export const PROJECT_CREATED = 'project-created' as const;
export const PROJECT_UPDATED = 'project-updated' as const;
export const PROJECT_DELETED = 'project-deleted' as const;
export const PROJECT_ARCHIVED = 'project-archived' as const;
export const PROJECT_REVIVED = 'project-revived' as const;
export const PROJECT_IMPORT = 'project-import' as const;
export const PROJECT_USER_ADDED = 'project-user-added' as const;
export const PROJECT_USER_REMOVED = 'project-user-removed' as const;
export const PROJECT_USER_ROLE_CHANGED = 'project-user-role-changed' as const;
export const PROJECT_GROUP_ADDED = 'project-group-added' as const;
export const DROP_PROJECTS = 'drop-projects' as const;
export const TAG_CREATED = 'tag-created' as const;
export const TAG_DELETED = 'tag-deleted' as const;
export const TAG_IMPORT = 'tag-import' as const;
export const DROP_TAGS = 'drop-tags' as const;
export const TAG_TYPE_CREATED = 'tag-type-created' as const;
export const TAG_TYPE_DELETED = 'tag-type-deleted' as const;
export const TAG_TYPE_UPDATED = 'tag-type-updated' as const;
export const TAG_TYPE_IMPORT = 'tag-type-import' as const;
export const DROP_TAG_TYPES = 'drop-tag-types' as const;
export const ADDON_CONFIG_CREATED = 'addon-config-created' as const;
export const ADDON_CONFIG_UPDATED = 'addon-config-updated' as const;
export const ADDON_CONFIG_DELETED = 'addon-config-deleted' as const;
export const DB_POOL_UPDATE = 'db-pool-update' as const;
export const USER_CREATED = 'user-created' as const;
export const USER_UPDATED = 'user-updated' as const;
export const USER_DELETED = 'user-deleted' as const;
export const DROP_ENVIRONMENTS = 'drop-environments' as const;
export const ENVIRONMENT_IMPORT = 'environment-import' as const;
export const ENVIRONMENT_CREATED = 'environment-created' as const;
export const ENVIRONMENT_UPDATED = 'environment-updated' as const;
export const ENVIRONMENT_DELETED = 'environment-deleted' as const;
export const SEGMENT_CREATED = 'segment-created' as const;
export const SEGMENT_UPDATED = 'segment-updated' as const;
export const SEGMENT_DELETED = 'segment-deleted' as const;

export const SEGMENT_IMPORT = 'segment-import' as const;
export const GROUP_CREATED = 'group-created' as const;
export const GROUP_UPDATED = 'group-updated' as const;
export const GROUP_DELETED = 'group-deleted' as const;
export const GROUP_USER_ADDED = 'group-user-added' as const;
export const GROUP_USER_REMOVED = 'group-user-removed' as const;
export const SETTING_CREATED = 'setting-created' as const;
export const SETTING_UPDATED = 'setting-updated' as const;
export const SETTING_DELETED = 'setting-deleted' as const;
export const PROJECT_ENVIRONMENT_ADDED = 'project-environment-added' as const;
export const PROJECT_ENVIRONMENT_REMOVED =
    'project-environment-removed' as const;
export const DEFAULT_STRATEGY_UPDATED = 'default-strategy-updated' as const;

export const CLIENT_METRICS = 'client-metrics' as const;
export const CLIENT_METRICS_ADDED = 'client-metrics-added' as const;
export const CLIENT_REGISTER = 'client-register' as const;

export const PAT_CREATED = 'pat-created' as const;
export const PAT_DELETED = 'pat-deleted' as const;

export const PUBLIC_SIGNUP_TOKEN_CREATED =
    'public-signup-token-created' as const;
export const PUBLIC_SIGNUP_TOKEN_USER_ADDED =
    'public-signup-token-user-added' as const;
export const PUBLIC_SIGNUP_TOKEN_TOKEN_UPDATED =
    'public-signup-token-updated' as const;

export const CHANGE_REQUEST_CREATED = 'change-request-created' as const;
export const CHANGE_REQUEST_DISCARDED = 'change-request-discarded' as const;
export const CHANGE_ADDED = 'change-added' as const;
export const CHANGE_DISCARDED = 'change-discarded' as const;
export const CHANGE_EDITED = 'change-edited' as const;
export const CHANGE_REQUEST_APPROVED = 'change-request-approved' as const;
export const CHANGE_REQUEST_REJECTED = 'change-request-rejected' as const;
export const CHANGE_REQUEST_APPROVAL_ADDED =
    'change-request-approval-added' as const;
export const CHANGE_REQUEST_CANCELLED = 'change-request-cancelled' as const;
export const CHANGE_REQUEST_SENT_TO_REVIEW =
    'change-request-sent-to-review' as const;
export const CHANGE_REQUEST_APPLIED = 'change-request-applied' as const;
export const CHANGE_REQUEST_SCHEDULE_SUSPENDED =
    'change-request-schedule-suspended' as const;
export const CHANGE_REQUEST_SCHEDULED = 'change-request-scheduled' as const;
export const CHANGE_REQUEST_SCHEDULED_APPLICATION_SUCCESS =
    'change-request-scheduled-application-success' as const;
export const CHANGE_REQUEST_SCHEDULED_APPLICATION_FAILURE =
    'change-request-scheduled-application-failure' as const;
export const CHANGE_REQUEST_CONFIGURATION_UPDATED =
    'change-request-configuration-updated' as const;
export const CHANGE_REQUEST_REQUESTED_APPROVERS_UPDATED =
    'change-request-requested-approvers-updated' as const;

export const API_TOKEN_CREATED = 'api-token-created' as const;
export const API_TOKEN_UPDATED = 'api-token-updated' as const;
export const API_TOKEN_DELETED = 'api-token-deleted' as const;

export const FEATURE_FAVORITED = 'feature-favorited' as const;
export const FEATURE_UNFAVORITED = 'feature-unfavorited' as const;
export const PROJECT_FAVORITED = 'project-favorited' as const;
export const PROJECT_UNFAVORITED = 'project-unfavorited' as const;
export const FEATURES_EXPORTED = 'features-exported' as const;
export const FEATURES_IMPORTED = 'features-imported' as const;

export const SERVICE_ACCOUNT_CREATED = 'service-account-created' as const;
export const SERVICE_ACCOUNT_UPDATED = 'service-account-updated' as const;
export const SERVICE_ACCOUNT_DELETED = 'service-account-deleted' as const;

export const FEATURE_POTENTIALLY_STALE_ON =
    'feature-potentially-stale-on' as const;

export const BANNER_CREATED = 'banner-created' as const;
export const BANNER_UPDATED = 'banner-updated' as const;
export const BANNER_DELETED = 'banner-deleted' as const;

export const SAFEGUARD_CHANGED = 'safeguard-changed' as const;
export const SAFEGUARD_DELETED = 'safeguard-deleted' as const;
export const SAFEGUARD_PROGRESSIONS_RESUMED =
    'safeguard-progressions-resumed' as const;
export const SAFEGUARD_PROGRESSIONS_PAUSED =
    'safeguard-progressions-paused' as const;

export const SIGNAL_ENDPOINT_CREATED = 'signal-endpoint-created' as const;
export const SIGNAL_ENDPOINT_UPDATED = 'signal-endpoint-updated' as const;
export const SIGNAL_ENDPOINT_DELETED = 'signal-endpoint-deleted' as const;

export const SIGNAL_ENDPOINT_TOKEN_CREATED =
    'signal-endpoint-token-created' as const;
export const SIGNAL_ENDPOINT_TOKEN_UPDATED =
    'signal-endpoint-token-updated' as const;
export const SIGNAL_ENDPOINT_TOKEN_DELETED =
    'signal-endpoint-token-deleted' as const;

export const ACTIONS_CREATED = 'actions-created' as const;
export const ACTIONS_UPDATED = 'actions-updated' as const;
export const ACTIONS_DELETED = 'actions-deleted' as const;

export const RELEASE_PLAN_TEMPLATE_CREATED =
    'release-plan-template-created' as const;
export const RELEASE_PLAN_TEMPLATE_UPDATED =
    'release-plan-template-updated' as const;
export const RELEASE_PLAN_TEMPLATE_DELETED =
    'release-plan-template-deleted' as const;
export const RELEASE_PLAN_TEMPLATE_ARCHIVED =
    'release-plan-template-archived' as const;

export const MILESTONE_PROGRESSION_CREATED =
    'milestone-progression-created' as const;
export const MILESTONE_PROGRESSION_UPDATED =
    'milestone-progression-updated' as const;
export const MILESTONE_PROGRESSION_DELETED =
    'milestone-progression-deleted' as const;
export const MILESTONE_PROGRESSION_CHANGED =
    'milestone-progression-changed' as const;

export const RELEASE_PLAN_ADDED = 'release-plan-added' as const;
export const RELEASE_PLAN_REMOVED = 'release-plan-removed' as const;
export const RELEASE_PLAN_MILESTONE_STARTED =
    'release-plan-milestone-started' as const;

export const IMPACT_METRIC_CREATED = 'impact-metric-created' as const;
export const IMPACT_METRIC_UPDATED = 'impact-metric-updated' as const;
export const IMPACT_METRIC_DELETED = 'impact-metric-deleted' as const;

export const USER_PREFERENCE_UPDATED = 'user-preference-updated' as const;
export const SCIM_USERS_DELETED = 'scim-users-deleted' as const;
export const SCIM_GROUPS_DELETED = 'scim-groups-deleted' as const;

export const CDN_TOKEN_CREATED = 'cdn-token-created' as const;

export const IEventTypes = [
    APPLICATION_CREATED,
    FEATURE_CREATED,
    FEATURE_DELETED,
    FEATURE_UPDATED,
    FEATURE_METADATA_UPDATED,
    FEATURE_VARIANTS_UPDATED,
    FEATURE_ENVIRONMENT_VARIANTS_UPDATED,
    FEATURE_PROJECT_CHANGE,
    FEATURE_ARCHIVED,
    FEATURE_REVIVED,
    FEATURE_IMPORT,
    FEATURE_TAGGED,
    FEATURE_TAG_IMPORT,
    FEATURE_STRATEGY_UPDATE,
    FEATURE_STRATEGY_ADD,
    FEATURE_STRATEGY_REMOVE,
    FEATURE_TYPE_UPDATED,
    FEATURE_COMPLETED,
    FEATURE_UNCOMPLETED,
    FEATURE_LINK_ADDED,
    FEATURE_LINK_REMOVED,
    FEATURE_LINK_UPDATED,
    STRATEGY_ORDER_CHANGED,
    DROP_FEATURE_TAGS,
    FEATURE_UNTAGGED,
    FEATURE_STALE_ON,
    FEATURE_STALE_OFF,
    DROP_FEATURES,
    FEATURE_ENVIRONMENT_ENABLED,
    FEATURE_ENVIRONMENT_DISABLED,
    STRATEGY_CREATED,
    STRATEGY_DELETED,
    STRATEGY_DEPRECATED,
    STRATEGY_REACTIVATED,
    STRATEGY_UPDATED,
    STRATEGY_IMPORT,
    DROP_STRATEGIES,
    CONTEXT_FIELD_CREATED,
    CONTEXT_FIELD_UPDATED,
    CONTEXT_FIELD_DELETED,
    PROJECT_ACCESS_ADDED,
    PROJECT_ACCESS_USER_ROLES_UPDATED,
    PROJECT_ACCESS_GROUP_ROLES_UPDATED,
    PROJECT_ACCESS_USER_ROLES_DELETED,
    PROJECT_ACCESS_GROUP_ROLES_DELETED,
    PROJECT_ACCESS_UPDATED,
    PROJECT_CREATED,
    PROJECT_UPDATED,
    PROJECT_DELETED,
    PROJECT_ARCHIVED,
    PROJECT_REVIVED,
    PROJECT_IMPORT,
    PROJECT_USER_ADDED,
    PROJECT_USER_REMOVED,
    PROJECT_USER_ROLE_CHANGED,
    PROJECT_GROUP_ADDED,
    ROLE_CREATED,
    ROLE_UPDATED,
    ROLE_DELETED,
    DROP_PROJECTS,
    TAG_CREATED,
    TAG_DELETED,
    TAG_IMPORT,
    DROP_TAGS,
    TAG_TYPE_CREATED,
    TAG_TYPE_DELETED,
    TAG_TYPE_UPDATED,
    TAG_TYPE_IMPORT,
    DROP_TAG_TYPES,
    ADDON_CONFIG_CREATED,
    ADDON_CONFIG_UPDATED,
    ADDON_CONFIG_DELETED,
    DB_POOL_UPDATE,
    USER_CREATED,
    USER_UPDATED,
    USER_DELETED,
    DROP_ENVIRONMENTS,
    ENVIRONMENT_IMPORT,
    ENVIRONMENT_CREATED,
    ENVIRONMENT_UPDATED,
    ENVIRONMENT_DELETED,
    SEGMENT_CREATED,
    SEGMENT_UPDATED,
    SEGMENT_DELETED,
    GROUP_CREATED,
    GROUP_UPDATED,
    GROUP_DELETED,
    GROUP_USER_ADDED,
    GROUP_USER_REMOVED,
    SETTING_CREATED,
    SETTING_UPDATED,
    SETTING_DELETED,
    CLIENT_METRICS,
    CLIENT_REGISTER,
    PAT_CREATED,
    PAT_DELETED,
    PUBLIC_SIGNUP_TOKEN_CREATED,
    PUBLIC_SIGNUP_TOKEN_USER_ADDED,
    PUBLIC_SIGNUP_TOKEN_TOKEN_UPDATED,
    CHANGE_REQUEST_CREATED,
    CHANGE_REQUEST_DISCARDED,
    CHANGE_ADDED,
    CHANGE_DISCARDED,
    CHANGE_EDITED,
    CHANGE_REQUEST_REJECTED,
    CHANGE_REQUEST_APPROVED,
    CHANGE_REQUEST_APPROVAL_ADDED,
    CHANGE_REQUEST_CANCELLED,
    CHANGE_REQUEST_SENT_TO_REVIEW,
    CHANGE_REQUEST_SCHEDULE_SUSPENDED,
    CHANGE_REQUEST_APPLIED,
    CHANGE_REQUEST_SCHEDULED,
    CHANGE_REQUEST_SCHEDULED_APPLICATION_SUCCESS,
    CHANGE_REQUEST_SCHEDULED_APPLICATION_FAILURE,
    CHANGE_REQUEST_CONFIGURATION_UPDATED,
    API_TOKEN_CREATED,
    API_TOKEN_UPDATED,
    API_TOKEN_DELETED,
    FEATURE_FAVORITED,
    FEATURE_UNFAVORITED,
    PROJECT_FAVORITED,
    PROJECT_UNFAVORITED,
    FEATURES_EXPORTED,
    FEATURES_IMPORTED,
    SERVICE_ACCOUNT_CREATED,
    SERVICE_ACCOUNT_DELETED,
    SERVICE_ACCOUNT_UPDATED,
    FEATURE_POTENTIALLY_STALE_ON,
    FEATURE_DEPENDENCY_ADDED,
    FEATURE_DEPENDENCY_REMOVED,
    FEATURE_DEPENDENCIES_REMOVED,
    BANNER_CREATED,
    BANNER_UPDATED,
    BANNER_DELETED,
    SAFEGUARD_CHANGED,
    SAFEGUARD_DELETED,
    SAFEGUARD_PROGRESSIONS_RESUMED,
    SAFEGUARD_PROGRESSIONS_PAUSED,
    PROJECT_ENVIRONMENT_ADDED,
    PROJECT_ENVIRONMENT_REMOVED,
    DEFAULT_STRATEGY_UPDATED,
    SEGMENT_IMPORT,
    SIGNAL_ENDPOINT_CREATED,
    SIGNAL_ENDPOINT_UPDATED,
    SIGNAL_ENDPOINT_DELETED,
    SIGNAL_ENDPOINT_TOKEN_CREATED,
    SIGNAL_ENDPOINT_TOKEN_UPDATED,
    SIGNAL_ENDPOINT_TOKEN_DELETED,
    ACTIONS_CREATED,
    ACTIONS_UPDATED,
    ACTIONS_DELETED,
    RELEASE_PLAN_TEMPLATE_CREATED,
    RELEASE_PLAN_TEMPLATE_UPDATED,
    RELEASE_PLAN_TEMPLATE_DELETED,
    RELEASE_PLAN_TEMPLATE_ARCHIVED,
    RELEASE_PLAN_ADDED,
    RELEASE_PLAN_REMOVED,
    RELEASE_PLAN_MILESTONE_STARTED,
    MILESTONE_PROGRESSION_CREATED,
    MILESTONE_PROGRESSION_UPDATED,
    MILESTONE_PROGRESSION_DELETED,
    MILESTONE_PROGRESSION_CHANGED,
    USER_PREFERENCE_UPDATED,
    SCIM_USERS_DELETED,
    SCIM_GROUPS_DELETED,
    CDN_TOKEN_CREATED,
    CHANGE_REQUEST_REQUESTED_APPROVERS_UPDATED,
    IMPACT_METRIC_CREATED,
    IMPACT_METRIC_UPDATED,
    IMPACT_METRIC_DELETED,
] as const;
export type IEventType = (typeof IEventTypes)[number];

// this represents the write model for events
export interface IBaseEvent {
    type: IEventType;
    createdBy: string;
    createdByUserId: number;
    project?: string;
    environment?: string;
    featureName?: string;
    ip: string;
    data?: any;
    preData?: any;
    tags?: ITag[];
}

// This represents the read model for events
export interface IEvent extends Omit<IBaseEvent, 'ip'> {
    id: number;
    createdAt: Date;
    ip?: string;
    groupType?: string;
    groupId?: string;
}

export interface IEnrichedEvent extends IEvent {
    label: string;
    summary: string;
}

export interface IEventList {
    totalEvents: number;
    events: IEvent[];
}
export const AccountTypes = ['User', 'Service Account'] as const;
