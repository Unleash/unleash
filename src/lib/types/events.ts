import { extractUsernameFromUser } from '../util';
import { FeatureToggle, IStrategyConfig, ITag, IVariant } from './model';
import { IApiToken } from './models/api-token';
import { IUser } from './user';

export const APPLICATION_CREATED = 'application-created';

// feature event types
export const FEATURE_CREATED = 'feature-created';
export const FEATURE_DELETED = 'feature-deleted';
export const FEATURE_UPDATED = 'feature-updated';
export const FEATURE_METADATA_UPDATED = 'feature-metadata-updated';
export const FEATURE_VARIANTS_UPDATED = 'feature-variants-updated';
export const FEATURE_ENVIRONMENT_VARIANTS_UPDATED =
    'feature-environment-variants-updated';
export const FEATURE_PROJECT_CHANGE = 'feature-project-change';
export const FEATURE_ARCHIVED = 'feature-archived';
export const FEATURE_REVIVED = 'feature-revived';
export const FEATURE_IMPORT = 'feature-import';
export const FEATURE_TAGGED = 'feature-tagged';
export const FEATURE_TAG_IMPORT = 'feature-tag-import';
export const FEATURE_STRATEGY_UPDATE = 'feature-strategy-update';
export const FEATURE_STRATEGY_ADD = 'feature-strategy-add';
export const FEATURE_STRATEGY_REMOVE = 'feature-strategy-remove';
export const DROP_FEATURE_TAGS = 'drop-feature-tags';
export const FEATURE_UNTAGGED = 'feature-untagged';
export const FEATURE_STALE_ON = 'feature-stale-on';
export const FEATURE_STALE_OFF = 'feature-stale-off';
export const DROP_FEATURES = 'drop-features';
export const FEATURE_ENVIRONMENT_ENABLED = 'feature-environment-enabled';
export const FEATURE_ENVIRONMENT_DISABLED = 'feature-environment-disabled';

export const STRATEGY_CREATED = 'strategy-created';
export const STRATEGY_DELETED = 'strategy-deleted';
export const STRATEGY_DEPRECATED = 'strategy-deprecated';
export const STRATEGY_REACTIVATED = 'strategy-reactivated';
export const STRATEGY_UPDATED = 'strategy-updated';
export const STRATEGY_IMPORT = 'strategy-import';
export const DROP_STRATEGIES = 'drop-strategies';
export const CONTEXT_FIELD_CREATED = 'context-field-created';
export const CONTEXT_FIELD_UPDATED = 'context-field-updated';
export const CONTEXT_FIELD_DELETED = 'context-field-deleted';
export const PROJECT_ACCESS_ADDED = 'project-access-added';
export const PROJECT_CREATED = 'project-created';
export const PROJECT_UPDATED = 'project-updated';
export const PROJECT_DELETED = 'project-deleted';
export const PROJECT_IMPORT = 'project-import';
export const PROJECT_USER_ADDED = 'project-user-added';
export const PROJECT_USER_REMOVED = 'project-user-removed';
export const PROJECT_USER_ROLE_CHANGED = 'project-user-role-changed';
export const PROJECT_GROUP_ADDED = 'project-group-added';
export const PROJECT_GROUP_REMOVED = 'project-group-removed';
export const PROJECT_GROUP_ROLE_CHANGED = 'project-group-role-changed';
export const DROP_PROJECTS = 'drop-projects';
export const TAG_CREATED = 'tag-created';
export const TAG_DELETED = 'tag-deleted';
export const TAG_IMPORT = 'tag-import';
export const DROP_TAGS = 'drop-tags';
export const TAG_TYPE_CREATED = 'tag-type-created';
export const TAG_TYPE_DELETED = 'tag-type-deleted';
export const TAG_TYPE_UPDATED = 'tag-type-updated';
export const TAG_TYPE_IMPORT = 'tag-type-import';
export const DROP_TAG_TYPES = 'drop-tag-types';
export const ADDON_CONFIG_CREATED = 'addon-config-created';
export const ADDON_CONFIG_UPDATED = 'addon-config-updated';
export const ADDON_CONFIG_DELETED = 'addon-config-deleted';
export const DB_POOL_UPDATE = 'db-pool-update';
export const USER_CREATED = 'user-created';
export const USER_UPDATED = 'user-updated';
export const USER_DELETED = 'user-deleted';
export const DROP_ENVIRONMENTS = 'drop-environments';
export const ENVIRONMENT_IMPORT = 'environment-import';
export const SEGMENT_CREATED = 'segment-created';
export const SEGMENT_UPDATED = 'segment-updated';
export const SEGMENT_DELETED = 'segment-deleted';
export const GROUP_CREATED = 'group-created';
export const GROUP_UPDATED = 'group-updated';
export const SETTING_CREATED = 'setting-created';
export const SETTING_UPDATED = 'setting-updated';
export const SETTING_DELETED = 'setting-deleted';

export const CLIENT_METRICS = 'client-metrics';
export const CLIENT_REGISTER = 'client-register';

export const PAT_CREATED = 'pat-created';
export const PAT_DELETED = 'pat-deleted';

export const PUBLIC_SIGNUP_TOKEN_CREATED = 'public-signup-token-created';
export const PUBLIC_SIGNUP_TOKEN_USER_ADDED = 'public-signup-token-user-added';
export const PUBLIC_SIGNUP_TOKEN_TOKEN_UPDATED = 'public-signup-token-updated';

export const CHANGE_REQUEST_CREATED = 'change-request-created';
export const CHANGE_REQUEST_DISCARDED = 'change-request-discarded';
export const CHANGE_ADDED = 'change-added';
export const CHANGE_DISCARDED = 'change-discarded';
export const CHANGE_REQUEST_APPROVED = 'change-request-approved';
export const CHANGE_REQUEST_APPROVAL_ADDED = 'change-request-approval-added';
export const CHANGE_REQUEST_CANCELLED = 'change-request-cancelled';
export const CHANGE_REQUEST_SENT_TO_REVIEW = 'change-request-sent-to-review';
export const CHANGE_REQUEST_APPLIED = 'change-request-applied';

export const API_TOKEN_CREATED = 'api-token-created';
export const API_TOKEN_UPDATED = 'api-token-updated';
export const API_TOKEN_DELETED = 'api-token-deleted';

export const FEATURE_FAVORITED = 'feature-favorited';
export const FEATURE_UNFAVORITED = 'feature-unfavorited';
export const PROJECT_FAVORITED = 'project-favorited';
export const PROJECT_UNFAVORITED = 'project-unfavorited';
export const FEATURES_EXPORTED = 'features-exported';
export const FEATURES_IMPORTED = 'features-imported';

export interface IBaseEvent {
    type: string;
    createdBy: string;
    project?: string;
    environment?: string;
    featureName?: string;
    data?: any;
    preData?: any;
    tags?: ITag[];
}

export interface IEvent extends IBaseEvent {
    id: number;
    createdAt: Date;
}

export interface IEventList {
    totalEvents: number;
    events: IEvent[];
}

class BaseEvent implements IBaseEvent {
    readonly type: string;

    readonly createdBy: string;

    readonly tags: ITag[];

    /**
     * @param createdBy accepts a string for backward compatibility. Prefer using IUser for standardization
     */
    constructor(type: string, createdBy: string | IUser, tags: ITag[] = []) {
        this.type = type;
        this.createdBy =
            typeof createdBy === 'string'
                ? createdBy
                : extractUsernameFromUser(createdBy);
        this.tags = tags;
    }
}

export class FeatureStaleEvent extends BaseEvent {
    readonly project: string;

    readonly featureName: string;

    /**
     * @param createdBy accepts a string for backward compatibility. Prefer using IUser for standardization
     */
    constructor(p: {
        stale: boolean;
        project: string;
        featureName: string;
        createdBy: string | IUser;
        tags: ITag[];
    }) {
        super(
            p.stale ? FEATURE_STALE_ON : FEATURE_STALE_OFF,
            p.createdBy,
            p.tags,
        );
        this.project = p.project;
        this.featureName = p.featureName;
    }
}

export class FeatureEnvironmentEvent extends BaseEvent {
    readonly project: string;

    readonly featureName: string;

    readonly environment: string;

    /**
     * @param createdBy accepts a string for backward compatibility. Prefer using IUser for standardization
     */
    constructor(p: {
        enabled: boolean;
        project: string;
        featureName: string;
        environment: string;
        createdBy: string | IUser;
        tags: ITag[];
    }) {
        super(
            p.enabled
                ? FEATURE_ENVIRONMENT_ENABLED
                : FEATURE_ENVIRONMENT_DISABLED,
            p.createdBy,
            p.tags,
        );
        this.project = p.project;
        this.featureName = p.featureName;
        this.environment = p.environment;
    }
}

export class FeatureVariantEvent extends BaseEvent {
    readonly project: string;

    readonly featureName: string;

    readonly data: { variants: IVariant[] };

    readonly preData: { variants: IVariant[] };

    /**
     * @param createdBy accepts a string for backward compatibility. Prefer using IUser for standardization
     */
    constructor(p: {
        project: string;
        featureName: string;
        createdBy: string | IUser;
        tags: ITag[];
        newVariants: IVariant[];
        oldVariants: IVariant[];
    }) {
        super(FEATURE_VARIANTS_UPDATED, p.createdBy, p.tags);
        this.project = p.project;
        this.featureName = p.featureName;
        this.data = { variants: p.newVariants };
        this.preData = { variants: p.oldVariants };
    }
}

export class EnvironmentVariantEvent extends BaseEvent {
    readonly project: string;

    readonly environment: string;

    readonly featureName: string;

    readonly data: { variants: IVariant[] };

    readonly preData: { variants: IVariant[] };

    /**
     * @param createdBy accepts a string for backward compatibility. Prefer using IUser for standardization
     */
    constructor(p: {
        featureName: string;
        environment: string;
        project: string;
        createdBy: string | IUser;
        newVariants: IVariant[];
        oldVariants: IVariant[];
    }) {
        super(FEATURE_ENVIRONMENT_VARIANTS_UPDATED, p.createdBy);
        this.featureName = p.featureName;
        this.environment = p.environment;
        this.project = p.project;
        this.data = { variants: p.newVariants };
        this.preData = { variants: p.oldVariants };
    }
}

export class FeatureChangeProjectEvent extends BaseEvent {
    readonly project: string;

    readonly featureName: string;

    readonly data: {
        oldProject: string;
        newProject: string;
    };

    /**
     * @param createdBy accepts a string for backward compatibility. Prefer using IUser for standardization
     */
    constructor(p: {
        oldProject: string;
        newProject: string;
        featureName: string;
        createdBy: string | IUser;
        tags: ITag[];
    }) {
        super(FEATURE_PROJECT_CHANGE, p.createdBy, p.tags);
        const { newProject, oldProject, featureName } = p;
        this.project = newProject;
        this.featureName = featureName;
        this.data = { newProject, oldProject };
    }
}

export class FeatureCreatedEvent extends BaseEvent {
    readonly project: string;

    readonly featureName: string;

    readonly data: FeatureToggle;

    /**
     * @param createdBy accepts a string for backward compatibility. Prefer using IUser for standardization
     */
    constructor(p: {
        project: string;
        featureName: string;
        createdBy: string | IUser;
        data: FeatureToggle;
        tags: ITag[];
    }) {
        super(FEATURE_CREATED, p.createdBy, p.tags);
        const { project, featureName, data } = p;
        this.project = project;
        this.featureName = featureName;
        this.data = data;
    }
}

export class FeatureArchivedEvent extends BaseEvent {
    readonly project: string;

    readonly featureName: string;

    /**
     * @param createdBy accepts a string for backward compatibility. Prefer using IUser for standardization
     */
    constructor(p: {
        project: string;
        featureName: string;
        createdBy: string | IUser;
        tags: ITag[];
    }) {
        super(FEATURE_ARCHIVED, p.createdBy, p.tags);
        const { project, featureName } = p;
        this.project = project;
        this.featureName = featureName;
    }
}

export class FeatureRevivedEvent extends BaseEvent {
    readonly project: string;

    readonly featureName: string;

    /**
     * @param createdBy accepts a string for backward compatibility. Prefer using IUser for standardization
     */
    constructor(p: {
        project: string;
        featureName: string;
        createdBy: string | IUser;
        tags: ITag[];
    }) {
        super(FEATURE_REVIVED, p.createdBy, p.tags);
        const { project, featureName } = p;
        this.project = project;
        this.featureName = featureName;
    }
}

export class FeatureDeletedEvent extends BaseEvent {
    readonly project: string;

    readonly featureName: string;

    readonly preData: FeatureToggle;

    /**
     * @param createdBy accepts a string for backward compatibility. Prefer using IUser for standardization
     */
    constructor(p: {
        project: string;
        featureName: string;
        preData: FeatureToggle;
        createdBy: string | IUser;
        tags: ITag[];
    }) {
        super(FEATURE_DELETED, p.createdBy, p.tags);
        const { project, featureName, preData } = p;
        this.project = project;
        this.featureName = featureName;
        this.preData = preData;
    }
}

export class FeatureMetadataUpdateEvent extends BaseEvent {
    readonly project: string;

    readonly featureName: string;

    readonly data: FeatureToggle;

    readonly preData: FeatureToggle;

    /**
     * @param createdBy accepts a string for backward compatibility. Prefer using IUser for standardization
     */
    constructor(p: {
        featureName: string;
        createdBy: string | IUser;
        project: string;
        data: FeatureToggle;
        preData: FeatureToggle;
        tags: ITag[];
    }) {
        super(FEATURE_METADATA_UPDATED, p.createdBy, p.tags);
        const { project, featureName, data, preData } = p;
        this.project = project;
        this.featureName = featureName;
        this.data = data;
        this.preData = preData;
    }
}

export class FeatureStrategyAddEvent extends BaseEvent {
    readonly project: string;

    readonly featureName: string;

    readonly environment: string;

    readonly data: IStrategyConfig;

    /**
     * @param createdBy accepts a string for backward compatibility. Prefer using IUser for standardization
     */
    constructor(p: {
        project: string;
        featureName: string;
        environment: string;
        createdBy: string | IUser;
        data: IStrategyConfig;
        tags: ITag[];
    }) {
        super(FEATURE_STRATEGY_ADD, p.createdBy, p.tags);
        const { project, featureName, environment, data } = p;
        this.project = project;
        this.featureName = featureName;
        this.environment = environment;
        this.data = data;
    }
}

export class FeatureStrategyUpdateEvent extends BaseEvent {
    readonly project: string;

    readonly featureName: string;

    readonly environment: string;

    readonly data: IStrategyConfig;

    readonly preData: IStrategyConfig;

    /**
     * @param createdBy accepts a string for backward compatibility. Prefer using IUser for standardization
     */
    constructor(p: {
        project: string;
        featureName: string;
        environment: string;
        createdBy: string | IUser;
        data: IStrategyConfig;
        preData: IStrategyConfig;
        tags: ITag[];
    }) {
        super(FEATURE_STRATEGY_UPDATE, p.createdBy, p.tags);
        const { project, featureName, environment, data, preData } = p;
        this.project = project;
        this.featureName = featureName;
        this.environment = environment;
        this.data = data;
        this.preData = preData;
    }
}

export class FeatureStrategyRemoveEvent extends BaseEvent {
    readonly project: string;

    readonly featureName: string;

    readonly environment: string;

    readonly preData: IStrategyConfig;

    /**
     * @param createdBy accepts a string for backward compatibility. Prefer using IUser for standardization
     */
    constructor(p: {
        project: string;
        featureName: string;
        environment: string;
        createdBy: string | IUser;
        preData: IStrategyConfig;
        tags: ITag[];
    }) {
        super(FEATURE_STRATEGY_REMOVE, p.createdBy, p.tags);
        const { project, featureName, environment, preData } = p;
        this.project = project;
        this.featureName = featureName;
        this.environment = environment;
        this.preData = preData;
    }
}

export class ProjectUserAddedEvent extends BaseEvent {
    readonly project: string;

    readonly data: any;

    readonly preData: any;

    /**
     * @param createdBy accepts a string for backward compatibility. Prefer using IUser for standardization
     */
    constructor(p: { project: string; createdBy: string | IUser; data: any }) {
        super(PROJECT_USER_ADDED, p.createdBy);
        const { project, data } = p;
        this.project = project;
        this.data = data;
        this.preData = null;
    }
}

export class ProjectUserRemovedEvent extends BaseEvent {
    readonly project: string;

    readonly data: any;

    readonly preData: any;

    /**
     * @param createdBy accepts a string for backward compatibility. Prefer using IUser for standardization
     */
    constructor(p: {
        project: string;
        createdBy: string | IUser;
        preData: any;
    }) {
        super(PROJECT_USER_REMOVED, p.createdBy);
        const { project, preData } = p;
        this.project = project;
        this.data = null;
        this.preData = preData;
    }
}

export class ProjectUserUpdateRoleEvent extends BaseEvent {
    readonly project: string;

    readonly data: any;

    readonly preData: any;

    /**
     * @param createdBy accepts a string for backward compatibility. Prefer using IUser for standardization
     */
    constructor(eventData: {
        project: string;
        createdBy: string | IUser;
        data: any;
        preData: any;
    }) {
        super(PROJECT_USER_ROLE_CHANGED, eventData.createdBy);
        const { project, data, preData } = eventData;
        this.project = project;
        this.data = data;
        this.preData = preData;
    }
}

export class ProjectGroupAddedEvent extends BaseEvent {
    readonly project: string;

    readonly data: any;

    readonly preData: any;

    /**
     * @param createdBy accepts a string for backward compatibility. Prefer using IUser for standardization
     */
    constructor(p: { project: string; createdBy: string | IUser; data: any }) {
        super(PROJECT_GROUP_ADDED, p.createdBy);
        const { project, data } = p;
        this.project = project;
        this.data = data;
        this.preData = null;
    }
}

export class ProjectGroupRemovedEvent extends BaseEvent {
    readonly project: string;

    readonly data: any;

    readonly preData: any;

    /**
     * @param createdBy accepts a string for backward compatibility. Prefer using IUser for standardization
     */
    constructor(p: {
        project: string;
        createdBy: string | IUser;
        preData: any;
    }) {
        super(PROJECT_GROUP_REMOVED, p.createdBy);
        const { project, preData } = p;
        this.project = project;
        this.data = null;
        this.preData = preData;
    }
}

export class ProjectGroupUpdateRoleEvent extends BaseEvent {
    readonly project: string;

    readonly data: any;

    readonly preData: any;

    /**
     * @param createdBy accepts a string for backward compatibility. Prefer using IUser for standardization
     */
    constructor(eventData: {
        project: string;
        createdBy: string | IUser;
        data: any;
        preData: any;
    }) {
        super(PROJECT_GROUP_ROLE_CHANGED, eventData.createdBy);
        const { project, data, preData } = eventData;
        this.project = project;
        this.data = data;
        this.preData = preData;
    }
}

export class ProjectAccessAddedEvent extends BaseEvent {
    readonly project: string;

    readonly data: any;

    readonly preData: any;

    /**
     * @param createdBy accepts a string for backward compatibility. Prefer using IUser for standardization
     */
    constructor(p: { project: string; createdBy: string | IUser; data: any }) {
        super(PROJECT_ACCESS_ADDED, p.createdBy);
        const { project, data } = p;
        this.project = project;
        this.data = data;
        this.preData = null;
    }
}

export class SettingCreatedEvent extends BaseEvent {
    readonly data: any;

    /**
     * @param createdBy accepts a string for backward compatibility. Prefer using IUser for standardization
     */
    constructor(eventData: { createdBy: string | IUser; data: any }) {
        super(SETTING_CREATED, eventData.createdBy);
        this.data = eventData.data;
    }
}

export class SettingDeletedEvent extends BaseEvent {
    readonly data: any;

    /**
     * @param createdBy accepts a string for backward compatibility. Prefer using IUser for standardization
     */
    constructor(eventData: { createdBy: string | IUser; data: any }) {
        super(SETTING_DELETED, eventData.createdBy);
        this.data = eventData.data;
    }
}

export class SettingUpdatedEvent extends BaseEvent {
    readonly data: any;

    /**
     * @param createdBy accepts a string for backward compatibility. Prefer using IUser for standardization
     */
    constructor(eventData: { createdBy: string | IUser; data: any }) {
        super(SETTING_UPDATED, eventData.createdBy);
        this.data = eventData.data;
    }
}

export class PublicSignupTokenCreatedEvent extends BaseEvent {
    readonly data: any;

    /**
     * @param createdBy accepts a string for backward compatibility. Prefer using IUser for standardization
     */
    constructor(eventData: { createdBy: string | IUser; data: any }) {
        super(PUBLIC_SIGNUP_TOKEN_CREATED, eventData.createdBy);
        this.data = eventData.data;
    }
}

export class PublicSignupTokenUpdatedEvent extends BaseEvent {
    readonly data: any;

    /**
     * @param createdBy accepts a string for backward compatibility. Prefer using IUser for standardization
     */
    constructor(eventData: { createdBy: string | IUser; data: any }) {
        super(PUBLIC_SIGNUP_TOKEN_TOKEN_UPDATED, eventData.createdBy);
        this.data = eventData.data;
    }
}

export class PublicSignupTokenUserAddedEvent extends BaseEvent {
    readonly data: any;

    /**
     * @param createdBy accepts a string for backward compatibility. Prefer using IUser for standardization
     */
    constructor(eventData: { createdBy: string | IUser; data: any }) {
        super(PUBLIC_SIGNUP_TOKEN_USER_ADDED, eventData.createdBy);
        this.data = eventData.data;
    }
}

export class ApiTokenCreatedEvent extends BaseEvent {
    readonly data: any;

    readonly environment: string;

    readonly project: string;

    /**
     * @param createdBy accepts a string for backward compatibility. Prefer using IUser for standardization
     */
    constructor(eventData: {
        createdBy: string | IUser;
        apiToken: Omit<IApiToken, 'secret'>;
    }) {
        super(API_TOKEN_CREATED, eventData.createdBy);
        this.data = eventData.apiToken;
        this.environment = eventData.apiToken.environment;
        this.project = eventData.apiToken.project;
    }
}

export class ApiTokenDeletedEvent extends BaseEvent {
    readonly preData: any;

    readonly environment: string;

    readonly project: string;

    /**
     * @param createdBy accepts a string for backward compatibility. Prefer using IUser for standardization
     */
    constructor(eventData: {
        createdBy: string | IUser;
        apiToken: Omit<IApiToken, 'secret'>;
    }) {
        super(API_TOKEN_DELETED, eventData.createdBy);
        this.preData = eventData.apiToken;
        this.environment = eventData.apiToken.environment;
        this.project = eventData.apiToken.project;
    }
}

export class ApiTokenUpdatedEvent extends BaseEvent {
    readonly preData: any;

    readonly data: any;

    readonly environment: string;

    readonly project: string;

    /**
     * @param createdBy accepts a string for backward compatibility. Prefer using IUser for standardization
     */
    constructor(eventData: {
        createdBy: string | IUser;
        previousToken: Omit<IApiToken, 'secret'>;
        apiToken: Omit<IApiToken, 'secret'>;
    }) {
        super(API_TOKEN_UPDATED, eventData.createdBy);
        this.preData = eventData.previousToken;
        this.data = eventData.apiToken;
        this.environment = eventData.apiToken.environment;
        this.project = eventData.apiToken.project;
    }
}
