import type {
    FeatureToggle,
    IEnvironment,
    IProject,
    IStrategyConfig,
    IVariant,
} from './model.js';
import type { IApiToken } from './model.js';
import type { IAuditUser, IUserWithRootRole } from './user.js';
import type { ITagType } from '../features/tag-type/tag-type-store-type.js';
import type { IFeatureAndTag } from './stores/feature-tag-store.js';
import {
    ADDON_CONFIG_CREATED,
    ADDON_CONFIG_DELETED,
    ADDON_CONFIG_UPDATED,
    API_TOKEN_CREATED,
    API_TOKEN_DELETED,
    API_TOKEN_UPDATED,
    DEFAULT_STRATEGY_UPDATED,
    DROP_ENVIRONMENTS,
    DROP_FEATURE_TAGS,
    DROP_FEATURES,
    DROP_PROJECTS,
    DROP_STRATEGIES,
    DROP_TAG_TYPES,
    DROP_TAGS,
    ENVIRONMENT_IMPORT,
    FEATURE_ARCHIVED,
    FEATURE_COMPLETED,
    FEATURE_CREATED,
    FEATURE_DELETED,
    FEATURE_ENVIRONMENT_DISABLED,
    FEATURE_ENVIRONMENT_ENABLED,
    FEATURE_ENVIRONMENT_VARIANTS_UPDATED,
    FEATURE_FAVORITED,
    FEATURE_IMPORT,
    FEATURE_METADATA_UPDATED,
    FEATURE_POTENTIALLY_STALE_ON,
    FEATURE_PROJECT_CHANGE,
    FEATURE_REVIVED,
    FEATURE_STALE_OFF,
    FEATURE_STALE_ON,
    FEATURE_STRATEGY_ADD,
    FEATURE_STRATEGY_REMOVE,
    FEATURE_STRATEGY_UPDATE,
    FEATURE_TAG_IMPORT,
    FEATURE_TAGGED,
    FEATURE_TYPE_UPDATED,
    FEATURE_UNCOMPLETED,
    STRATEGY_ORDER_CHANGED,
    STRATEGY_CREATED,
    STRATEGY_DELETED,
    STRATEGY_DEPRECATED,
    STRATEGY_REACTIVATED,
    STRATEGY_UPDATED,
    STRATEGY_IMPORT,
    FEATURE_UNFAVORITED,
    FEATURE_UPDATED,
    FEATURE_VARIANTS_UPDATED,
    FEATURES_EXPORTED,
    FEATURES_IMPORTED,
    GROUP_DELETED,
    GROUP_UPDATED,
    GROUP_USER_ADDED,
    GROUP_USER_REMOVED,
    PAT_CREATED,
    PAT_DELETED,
    PROJECT_ACCESS_ADDED,
    PROJECT_ACCESS_GROUP_ROLES_DELETED,
    PROJECT_ACCESS_GROUP_ROLES_UPDATED,
    PROJECT_ACCESS_USER_ROLES_DELETED,
    PROJECT_ACCESS_USER_ROLES_UPDATED,
    PROJECT_ARCHIVED,
    PROJECT_CREATED,
    PROJECT_DELETED,
    PROJECT_ENVIRONMENT_ADDED,
    PROJECT_ENVIRONMENT_REMOVED,
    PROJECT_FAVORITED,
    PROJECT_GROUP_ADDED,
    PROJECT_IMPORT,
    PROJECT_REVIVED,
    PROJECT_UNFAVORITED,
    PROJECT_UPDATED,
    PROJECT_USER_ADDED,
    PROJECT_USER_REMOVED,
    PROJECT_USER_ROLE_CHANGED,
    PUBLIC_SIGNUP_TOKEN_CREATED,
    PUBLIC_SIGNUP_TOKEN_TOKEN_UPDATED,
    PUBLIC_SIGNUP_TOKEN_USER_ADDED,
    RELEASE_PLAN_ADDED,
    RELEASE_PLAN_MILESTONE_STARTED,
    RELEASE_PLAN_REMOVED,
    RELEASE_PLAN_TEMPLATE_ARCHIVED,
    RELEASE_PLAN_TEMPLATE_CREATED,
    RELEASE_PLAN_TEMPLATE_DELETED,
    RELEASE_PLAN_TEMPLATE_UPDATED,
    ROLE_CREATED,
    ROLE_DELETED,
    ROLE_UPDATED,
    SCIM_GROUPS_DELETED,
    SCIM_USERS_DELETED,
    SEGMENT_CREATED,
    SEGMENT_DELETED,
    SEGMENT_UPDATED,
    SETTING_CREATED,
    SETTING_DELETED,
    SETTING_UPDATED,
    TAG_CREATED,
    TAG_DELETED,
    TAG_IMPORT,
    TAG_TYPE_DELETED,
    TAG_TYPE_IMPORT,
    TAG_TYPE_UPDATED,
    USER_CREATED,
    USER_DELETED,
    USER_PREFERENCE_UPDATED,
    USER_UPDATED,
    type IBaseEvent,
    type IEventType,
    FEATURE_LINK_REMOVED,
    FEATURE_LINK_UPDATED,
    FEATURE_LINK_ADDED,
    APPLICATION_CREATED,
    MILESTONE_PROGRESSION_DELETED,
    MILESTONE_PROGRESSION_CHANGED,
} from '../events/index.js';
import type { ITag } from '../tags/index.js';
import type { IClientApplication } from './stores/client-applications-store.js';

export class BaseEvent implements IBaseEvent {
    readonly type: IEventType;

    readonly createdBy: string;

    readonly createdByUserId: number;

    readonly ip: string;

    /**
     * @param type the type of the event we're creating.
     * @param auditUser User info used to track which user performed the action. Includes username (email or username), userId and ip
     */
    constructor(type: IEventType, auditUser: IAuditUser) {
        this.type = type;
        this.createdBy = auditUser.username || 'unknown';
        this.createdByUserId = auditUser.id || -1337;
        this.ip = auditUser.ip || '';
    }
}

export class FeatureStaleEvent extends BaseEvent {
    readonly project: string;

    readonly featureName: string;

    constructor(p: {
        stale: boolean;
        project: string;
        featureName: string;
        auditUser: IAuditUser;
    }) {
        super(p.stale ? FEATURE_STALE_ON : FEATURE_STALE_OFF, p.auditUser);
        this.project = p.project;
        this.featureName = p.featureName;
    }
}

export class FeatureEnvironmentEvent extends BaseEvent {
    readonly project: string;

    readonly featureName: string;

    readonly environment: string;

    constructor(p: {
        enabled: boolean;
        project: string;
        featureName: string;
        environment: string;
        auditUser: IAuditUser;
    }) {
        super(
            p.enabled
                ? FEATURE_ENVIRONMENT_ENABLED
                : FEATURE_ENVIRONMENT_DISABLED,
            p.auditUser,
        );
        this.project = p.project;
        this.featureName = p.featureName;
        this.environment = p.environment;
    }
}

export type StrategyIds = {
    strategyIds: string[];
};

export class StrategiesOrderChangedEvent extends BaseEvent {
    readonly project: string;

    readonly featureName: string;

    readonly environment: string;

    readonly data: StrategyIds;

    readonly preData: StrategyIds;

    constructor(p: {
        project: string;
        featureName: string;
        environment: string;
        data: StrategyIds;
        preData: StrategyIds;
        auditUser: IAuditUser;
    }) {
        super(STRATEGY_ORDER_CHANGED, p.auditUser);
        const { project, featureName, environment, data, preData } = p;
        this.project = project;
        this.featureName = featureName;
        this.environment = environment;
        this.data = data;
        this.preData = preData;
    }
}

export class FeatureVariantEvent extends BaseEvent {
    readonly project: string;

    readonly featureName: string;

    readonly data: {
        variants: IVariant[];
    };

    readonly preData: {
        variants: IVariant[];
    };

    constructor(p: {
        project: string;
        featureName: string;
        newVariants: IVariant[];
        oldVariants: IVariant[];
        auditUser: IAuditUser;
    }) {
        super(FEATURE_VARIANTS_UPDATED, p.auditUser);
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

    readonly data: {
        variants: IVariant[];
    };

    readonly preData: {
        variants: IVariant[];
    };

    /**
     */
    constructor(p: {
        featureName: string;
        environment: string;
        project: string;
        newVariants: IVariant[];
        oldVariants: IVariant[];
        auditUser: IAuditUser;
    }) {
        super(FEATURE_ENVIRONMENT_VARIANTS_UPDATED, p.auditUser);
        this.featureName = p.featureName;
        this.environment = p.environment;
        this.project = p.project;
        this.data = { variants: p.newVariants };
        this.preData = { variants: p.oldVariants };
    }
}

export class ProjectCreatedEvent extends BaseEvent {
    readonly project: string;
    readonly data: any;

    constructor(eventData: {
        data: any;
        project: string;
        auditUser: IAuditUser;
    }) {
        super(PROJECT_CREATED, eventData.auditUser);
        this.project = eventData.project;
        this.data = eventData.data;
    }
}

export class ProjectUpdatedEvent extends BaseEvent {
    readonly project: string;
    readonly data: any;
    readonly preData: any;

    constructor(eventData: {
        data: any;
        preData: any;
        project: string;
        auditUser: IAuditUser;
    }) {
        super(PROJECT_UPDATED, eventData.auditUser);
        this.project = eventData.project;
        this.data = eventData.data;
        this.preData = eventData.preData;
    }
}

export class ProjectDeletedEvent extends BaseEvent {
    readonly project: string;

    constructor(eventData: {
        project: string;
        auditUser: IAuditUser;
    }) {
        super(PROJECT_DELETED, eventData.auditUser);
        this.project = eventData.project;
    }
}

export class ProjectArchivedEvent extends BaseEvent {
    readonly project: string;

    constructor(eventData: {
        project: string;
        auditUser: IAuditUser;
    }) {
        super(PROJECT_ARCHIVED, eventData.auditUser);
        this.project = eventData.project;
    }
}

export class ProjectRevivedEvent extends BaseEvent {
    readonly project: string;

    constructor(eventData: {
        project: string;
        auditUser: IAuditUser;
    }) {
        super(PROJECT_REVIVED, eventData.auditUser);
        this.project = eventData.project;
    }
}

export class RoleUpdatedEvent extends BaseEvent {
    readonly data: any;
    readonly preData: any;

    constructor(eventData: {
        auditUser: IAuditUser;
        data: any;
        preData: any;
    }) {
        super(ROLE_UPDATED, eventData.auditUser);
        this.data = eventData.data;
        this.preData = eventData.preData;
    }
}

export class FeatureChangeProjectEvent extends BaseEvent {
    readonly project: string;

    readonly featureName: string;

    readonly data: {
        oldProject: string;
        newProject: string;
    };

    constructor(p: {
        oldProject: string;
        newProject: string;
        featureName: string;
        auditUser: IAuditUser;
    }) {
        super(FEATURE_PROJECT_CHANGE, p.auditUser);
        const { newProject, oldProject, featureName } = p;
        this.project = newProject;
        this.featureName = featureName;
        this.data = {
            newProject,
            oldProject,
        };
    }
}

export class FeatureCreatedEvent extends BaseEvent {
    readonly project: string;

    readonly featureName: string;

    readonly data: FeatureToggle;

    constructor(p: {
        project: string;
        featureName: string;
        data: FeatureToggle;
        auditUser: IAuditUser;
    }) {
        super(FEATURE_CREATED, p.auditUser);
        const { project, featureName, data } = p;
        this.project = project;
        this.featureName = featureName;
        this.data = data;
    }
}

export class ProjectImport extends BaseEvent {
    readonly data: IProject;
    constructor(p: {
        project: IProject;
        auditUser: IAuditUser;
    }) {
        super(PROJECT_IMPORT, p.auditUser);
        this.data = p.project;
    }
}

export class FeatureImport extends BaseEvent {
    readonly data: any;
    constructor(p: {
        feature: any;
        auditUser: IAuditUser;
    }) {
        super(FEATURE_IMPORT, p.auditUser);
        this.data = p.feature;
    }
}

export class StrategyImport extends BaseEvent {
    readonly data: any;
    constructor(p: {
        strategy: any;
        auditUser: IAuditUser;
    }) {
        super(STRATEGY_IMPORT, p.auditUser);
        this.data = p.strategy;
    }
}

export class EnvironmentImport extends BaseEvent {
    readonly data: IEnvironment;
    constructor(p: {
        env: IEnvironment;
        auditUser: IAuditUser;
    }) {
        super(ENVIRONMENT_IMPORT, p.auditUser);
        this.data = p.env;
    }
}

export class TagTypeImport extends BaseEvent {
    readonly data: ITagType;
    constructor(p: {
        tagType: ITagType;
        auditUser: IAuditUser;
    }) {
        super(TAG_TYPE_IMPORT, p.auditUser);
        this.data = p.tagType;
    }
}

export class TagImport extends BaseEvent {
    readonly data: ITag;
    constructor(p: {
        tag: ITag;
        auditUser: IAuditUser;
    }) {
        super(TAG_IMPORT, p.auditUser);
        this.data = p.tag;
    }
}

export class FeatureTagImport extends BaseEvent {
    readonly data: IFeatureAndTag;
    constructor(p: {
        featureTag: IFeatureAndTag;
        auditUser: IAuditUser;
    }) {
        super(FEATURE_TAG_IMPORT, p.auditUser);
        this.data = p.featureTag;
    }
}

export type FeatureLifecycleCompleted = {
    kept: boolean;
    status: 'kept' | 'discarded';
    statusValue?: string;
};

export class FeatureCompletedEvent extends BaseEvent {
    readonly featureName: string;
    readonly data: FeatureLifecycleCompleted;
    readonly project: string;

    constructor(p: {
        project: string;
        featureName: string;
        data: FeatureLifecycleCompleted;
        auditUser: IAuditUser;
    }) {
        super(FEATURE_COMPLETED, p.auditUser);
        const { featureName, data, project } = p;
        this.featureName = featureName;
        this.data = data;
        this.project = project;
    }
}

export class FeatureUncompletedEvent extends BaseEvent {
    readonly featureName: string;
    readonly project: string;

    constructor(p: {
        featureName: string;
        auditUser: IAuditUser;
        project: string;
    }) {
        super(FEATURE_UNCOMPLETED, p.auditUser);
        const { featureName, project } = p;
        this.featureName = featureName;
        this.project = project;
    }
}

export class FeatureUpdatedEvent extends BaseEvent {
    readonly data: any;
    readonly featureName: string;
    readonly project: string;

    constructor(eventData: {
        project: string;
        featureName: string;
        data: any;
        auditUser: IAuditUser;
    }) {
        super(FEATURE_UPDATED, eventData.auditUser);
        this.data = eventData.data;
        this.project = eventData.project;
        this.featureName = eventData.featureName;
    }
}

export class FeatureTaggedEvent extends BaseEvent {
    readonly data: any;
    readonly featureName: string;
    readonly project: string;

    constructor(eventData: {
        project: string;
        featureName: string;
        data: any;
        auditUser: IAuditUser;
    }) {
        super(FEATURE_TAGGED, eventData.auditUser);
        this.project = eventData.project;
        this.featureName = eventData.featureName;
        this.data = eventData.data;
    }
}

export class FeatureTypeUpdatedEvent extends BaseEvent {
    readonly data: any;
    readonly preData: any;

    constructor(eventData: {
        data: any;
        preData: any;
        auditUser: IAuditUser;
    }) {
        super(FEATURE_TYPE_UPDATED, eventData.auditUser);
        this.data = eventData.data;
        this.preData = eventData.preData;
    }
}

export class FeatureDependencyAddedEvent extends BaseEvent {
    readonly project: string;
    readonly featureName: string;
    readonly data: any;

    constructor(eventData: {
        project: string;
        featureName: string;
        auditUser: IAuditUser;
        data: any;
    }) {
        super('feature-dependency-added', eventData.auditUser);
        this.project = eventData.project;
        this.featureName = eventData.featureName;
        this.data = eventData.data;
    }
}

export class FeatureDependencyRemovedEvent extends BaseEvent {
    readonly project: string;
    readonly featureName: string;
    readonly data: any;

    constructor(eventData: {
        project: string;
        featureName: string;
        auditUser: IAuditUser;
        data: any;
    }) {
        super('feature-dependency-removed', eventData.auditUser);
        this.project = eventData.project;
        this.featureName = eventData.featureName;
        this.data = eventData.data;
    }
}

export class FeatureDependenciesRemovedEvent extends BaseEvent {
    readonly project: string;
    readonly featureName: string;

    constructor(eventData: {
        project: string;
        featureName: string;
        auditUser: IAuditUser;
    }) {
        super('feature-dependencies-removed', eventData.auditUser);
        this.project = eventData.project;
        this.featureName = eventData.featureName;
    }
}

export class FeaturesImportedEvent extends BaseEvent {
    readonly project: string;
    readonly environment: string;

    constructor(eventData: {
        project: string;
        environment: string;
        auditUser: IAuditUser;
    }) {
        super(FEATURES_IMPORTED, eventData.auditUser);
        this.project = eventData.project;
        this.environment = eventData.environment;
    }
}

export class FeatureArchivedEvent extends BaseEvent {
    readonly project: string;

    readonly featureName: string;

    constructor(p: {
        project: string;
        featureName: string;
        auditUser: IAuditUser;
    }) {
        super(FEATURE_ARCHIVED, p.auditUser);
        const { project, featureName } = p;
        this.project = project;
        this.featureName = featureName;
    }
}

export class FeatureRevivedEvent extends BaseEvent {
    readonly project: string;

    readonly featureName: string;

    /**
     */
    constructor(p: {
        project: string;
        featureName: string;
        auditUser: IAuditUser;
    }) {
        super(FEATURE_REVIVED, p.auditUser);
        const { project, featureName } = p;
        this.project = project;
        this.featureName = featureName;
    }
}

export class FeatureDeletedEvent extends BaseEvent {
    readonly project: string;

    readonly featureName: string;

    readonly preData: FeatureToggle;

    readonly tags: ITag[];

    /**
     */
    constructor(p: {
        project: string;
        featureName: string;
        preData: FeatureToggle;
        tags: ITag[];
        auditUser: IAuditUser;
    }) {
        super(FEATURE_DELETED, p.auditUser);
        const { project, featureName, preData } = p;
        this.project = project;
        this.featureName = featureName;
        this.preData = preData;
        this.tags = p.tags;
    }
}

export class FeatureMetadataUpdateEvent extends BaseEvent {
    readonly project: string;

    readonly featureName: string;

    readonly data: FeatureToggle;

    readonly preData: FeatureToggle;

    /**
     */
    constructor(p: {
        featureName: string;
        project: string;
        data: FeatureToggle;
        preData: FeatureToggle;
        auditUser: IAuditUser;
    }) {
        super(FEATURE_METADATA_UPDATED, p.auditUser);
        const { project, featureName, data, preData } = p;
        this.project = project;
        this.featureName = featureName;
        this.data = data;
        this.preData = preData;
    }
}

export class FeatureLinkAddedEvent extends BaseEvent {
    readonly project: string;

    readonly featureName: string;

    readonly data: { url: string; title?: string };
    readonly preData: null;

    constructor(p: {
        featureName: string;
        project: string;
        data: { url: string; title?: string };
        auditUser: IAuditUser;
    }) {
        super(FEATURE_LINK_ADDED, p.auditUser);
        const { project, featureName, data } = p;
        this.project = project;
        this.featureName = featureName;
        this.data = data;
        this.preData = null;
    }
}

export class FeatureLinkUpdatedEvent extends BaseEvent {
    readonly project: string;

    readonly featureName: string;

    readonly data: { url: string; title?: string };

    readonly preData: { url: string; title?: string };

    constructor(p: {
        featureName: string;
        project: string;
        data: { url: string; title?: string };
        preData: { url: string; title?: string };
        auditUser: IAuditUser;
    }) {
        super(FEATURE_LINK_UPDATED, p.auditUser);
        const { project, featureName, data, preData } = p;
        this.project = project;
        this.featureName = featureName;
        this.data = data;
        this.preData = preData;
    }
}

export class FeatureLinkRemovedEvent extends BaseEvent {
    readonly project: string;

    readonly featureName: string;

    readonly preData: { url: string; title?: string };
    readonly data: null;

    constructor(p: {
        featureName: string;
        project: string;
        preData: { url: string; title?: string };
        auditUser: IAuditUser;
    }) {
        super(FEATURE_LINK_REMOVED, p.auditUser);
        const { project, featureName, preData } = p;
        this.project = project;
        this.featureName = featureName;
        this.data = null;
        this.preData = preData;
    }
}

export class FeatureStrategyAddEvent extends BaseEvent {
    readonly project: string;

    readonly featureName: string;

    readonly environment: string;

    readonly data: IStrategyConfig;

    /**
     */
    constructor(p: {
        project: string;
        featureName: string;
        environment: string;
        data: IStrategyConfig;
        auditUser: IAuditUser;
    }) {
        super(FEATURE_STRATEGY_ADD, p.auditUser);
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
     */
    constructor(p: {
        project: string;
        featureName: string;
        environment: string;
        data: IStrategyConfig;
        preData: IStrategyConfig;
        auditUser: IAuditUser;
    }) {
        super(FEATURE_STRATEGY_UPDATE, p.auditUser);
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

    constructor(p: {
        project: string;
        featureName: string;
        environment: string;
        preData: IStrategyConfig;
        auditUser: IAuditUser;
    }) {
        super(FEATURE_STRATEGY_REMOVE, p.auditUser);
        const { project, featureName, environment, preData } = p;
        this.project = project;
        this.featureName = featureName;
        this.environment = environment;
        this.preData = preData;
    }
}

export class FeatureFavoritedEvent extends BaseEvent {
    readonly featureName: string;
    readonly data: any;

    constructor(eventData: {
        featureName: string;
        data: any;
        auditUser: IAuditUser;
    }) {
        super(FEATURE_FAVORITED, eventData.auditUser);
        this.data = eventData.data;
        this.featureName = eventData.featureName;
    }
}

export class ProjectFavoritedEvent extends BaseEvent {
    readonly project: string;
    readonly data: any;

    constructor(eventData: {
        project: string;
        data: any;
        auditUser: IAuditUser;
    }) {
        super(PROJECT_FAVORITED, eventData.auditUser);
        this.data = eventData.data;
        this.project = eventData.project;
    }
}

export class FeatureUnfavoritedEvent extends BaseEvent {
    readonly featureName: string;
    readonly data: any;

    constructor(eventData: {
        featureName: string;
        data: any;
        auditUser: IAuditUser;
    }) {
        super(FEATURE_UNFAVORITED, eventData.auditUser);
        this.data = eventData.data;
        this.featureName = eventData.featureName;
    }
}

export class ProjectUnfavoritedEvent extends BaseEvent {
    readonly project: string;
    readonly data: any;

    constructor(eventData: {
        project: string;
        data: any;
        auditUser: IAuditUser;
    }) {
        super(PROJECT_UNFAVORITED, eventData.auditUser);
        this.data = eventData.data;
        this.project = eventData.project;
    }
}

export class ProjectUserAddedEvent extends BaseEvent {
    readonly project: string;

    readonly data: any;

    readonly preData: any;

    /**
     */
    constructor(p: {
        project: string;
        data: any;
        auditUser: IAuditUser;
    }) {
        super(PROJECT_USER_ADDED, p.auditUser);
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

    constructor(p: {
        project: string;
        preData: any;
        auditUser: IAuditUser;
    }) {
        super(PROJECT_USER_REMOVED, p.auditUser);
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

    constructor(eventData: {
        project: string;
        data: any;
        preData: any;
        auditUser: IAuditUser;
    }) {
        super(PROJECT_USER_ROLE_CHANGED, eventData.auditUser);
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

    constructor(p: {
        project: string;
        data: any;
        auditUser: IAuditUser;
    }) {
        super(PROJECT_GROUP_ADDED, p.auditUser);
        const { project, data } = p;
        this.project = project;
        this.data = data;
        this.preData = null;
    }
}

export class ProjectAccessAddedEvent extends BaseEvent {
    readonly project: string;

    readonly data: any;

    readonly preData: any;

    constructor(p: {
        project: string;
        data: any;
        auditUser: IAuditUser;
    }) {
        super(PROJECT_ACCESS_ADDED, p.auditUser);
        const { project, data } = p;
        this.project = project;
        this.data = data;
        this.preData = null;
    }
}

export class ProjectAccessUserRolesUpdated extends BaseEvent {
    readonly project: string;

    readonly data: any;

    readonly preData: any;

    constructor(p: {
        project: string;
        data: any;
        preData: any;
        auditUser: IAuditUser;
    }) {
        super(PROJECT_ACCESS_USER_ROLES_UPDATED, p.auditUser);
        const { project, data, preData } = p;
        this.project = project;
        this.data = data;
        this.preData = preData;
    }
}

export class ProjectAccessGroupRolesUpdated extends BaseEvent {
    readonly project: string;

    readonly data: any;

    readonly preData: any;

    constructor(p: {
        project: string;
        data: any;
        preData: any;
        auditUser: IAuditUser;
    }) {
        super(PROJECT_ACCESS_GROUP_ROLES_UPDATED, p.auditUser);
        const { project, data, preData } = p;
        this.project = project;
        this.data = data;
        this.preData = preData;
    }
}

export class GroupUserRemoved extends BaseEvent {
    readonly preData: any;
    constructor(p: {
        userId: number;
        groupId: number;
        auditUser: IAuditUser;
    }) {
        super(GROUP_USER_REMOVED, p.auditUser);
        this.preData = {
            groupId: p.groupId,
            userId: p.userId,
        };
    }
}

export class GroupUserAdded extends BaseEvent {
    readonly data: any;
    constructor(p: {
        userId: number;
        groupId: number;
        auditUser: IAuditUser;
    }) {
        super(GROUP_USER_ADDED, p.auditUser);
        this.data = {
            groupId: p.groupId,
            userId: p.userId,
        };
    }
}

export class ProjectAccessUserRolesDeleted extends BaseEvent {
    readonly project: string;

    readonly data: null;

    readonly preData: any;

    constructor(p: {
        project: string;
        preData: any;
        auditUser: IAuditUser;
    }) {
        super(PROJECT_ACCESS_USER_ROLES_DELETED, p.auditUser);
        const { project, preData } = p;
        this.project = project;
        this.data = null;
        this.preData = preData;
    }
}

export class ProjectAccessGroupRolesDeleted extends BaseEvent {
    readonly project: string;

    readonly data: null;

    readonly preData: any;

    constructor(p: {
        project: string;
        preData: any;
        auditUser: IAuditUser;
    }) {
        super(PROJECT_ACCESS_GROUP_ROLES_DELETED, p.auditUser);
        const { project, preData } = p;
        this.project = project;
        this.data = null;
        this.preData = preData;
    }
}

export class SettingCreatedEvent extends BaseEvent {
    readonly data: any;

    constructor(eventData: {
        data: any;
        auditUser: IAuditUser;
    }) {
        super(SETTING_CREATED, eventData.auditUser);
        this.data = eventData.data;
    }
}

export class SettingDeletedEvent extends BaseEvent {
    readonly data: any;

    constructor(eventData: {
        data: any;
        auditUser: IAuditUser;
    }) {
        super(SETTING_DELETED, eventData.auditUser);
        this.data = eventData.data;
    }
}

export class SettingUpdatedEvent extends BaseEvent {
    readonly data: any;
    readonly preData: any;

    constructor(
        eventData: {
            data: any;
            auditUser: IAuditUser;
        },
        preData: any,
    ) {
        super(SETTING_UPDATED, eventData.auditUser);
        this.data = eventData.data;
        this.preData = preData;
    }
}

export class PublicSignupTokenCreatedEvent extends BaseEvent {
    readonly data: any;

    constructor(eventData: {
        data: any;
        auditUser: IAuditUser;
    }) {
        super(PUBLIC_SIGNUP_TOKEN_CREATED, eventData.auditUser);
        this.data = eventData.data;
    }
}

export class PublicSignupTokenUpdatedEvent extends BaseEvent {
    readonly data: any;

    constructor(eventData: {
        data: any;
        auditUser: IAuditUser;
    }) {
        super(PUBLIC_SIGNUP_TOKEN_TOKEN_UPDATED, eventData.auditUser);
        this.data = eventData.data;
    }
}

export class PublicSignupTokenUserAddedEvent extends BaseEvent {
    readonly data: any;

    constructor(eventData: {
        data: any;
        auditUser: IAuditUser;
    }) {
        super(PUBLIC_SIGNUP_TOKEN_USER_ADDED, eventData.auditUser);
        this.data = eventData.data;
    }
}

export class ApiTokenCreatedEvent extends BaseEvent {
    readonly data: any;

    readonly environment: string;

    readonly project: string;

    constructor(eventData: {
        apiToken: Omit<IApiToken, 'secret'>;
        auditUser: IAuditUser;
    }) {
        super(API_TOKEN_CREATED, eventData.auditUser);
        this.data = eventData.apiToken;
        this.environment = eventData.apiToken.environment;
        this.project = eventData.apiToken.project;
    }
}

export class ApiTokenDeletedEvent extends BaseEvent {
    readonly preData: any;

    readonly environment: string;

    readonly project: string;

    constructor(eventData: {
        apiToken: Omit<IApiToken, 'secret'>;
        auditUser: IAuditUser;
    }) {
        super(API_TOKEN_DELETED, eventData.auditUser);
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

    constructor(eventData: {
        previousToken: Omit<IApiToken, 'secret'>;
        apiToken: Omit<IApiToken, 'secret'>;
        auditUser: IAuditUser;
    }) {
        super(API_TOKEN_UPDATED, eventData.auditUser);
        this.preData = eventData.previousToken;
        this.data = eventData.apiToken;
        this.environment = eventData.apiToken.environment;
        this.project = eventData.apiToken.project;
    }
}

export class PotentiallyStaleOnEvent extends BaseEvent {
    readonly featureName: string;

    readonly project: string;

    constructor(eventData: {
        featureName: string;
        project: string;
        auditUser: IAuditUser;
    }) {
        super(FEATURE_POTENTIALLY_STALE_ON, eventData.auditUser);
        this.featureName = eventData.featureName;
        this.project = eventData.project;
    }
}

export class UserCreatedEvent extends BaseEvent {
    readonly data: IUserEventData;

    constructor(eventData: {
        userCreated: IUserEventData;
        auditUser: IAuditUser;
    }) {
        super(USER_CREATED, eventData.auditUser);
        this.data = mapUserToData(eventData.userCreated);
    }
}

export class UserUpdatedEvent extends BaseEvent {
    readonly data: IUserEventData;
    readonly preData: IUserEventData;

    constructor(eventData: {
        preUser: IUserEventData;
        postUser: IUserEventData;
        auditUser: IAuditUser;
    }) {
        super(USER_UPDATED, eventData.auditUser);
        this.preData = mapUserToData(eventData.preUser);
        this.data = mapUserToData(eventData.postUser);
    }
}

export class UserDeletedEvent extends BaseEvent {
    readonly preData: IUserEventData;

    constructor(eventData: {
        deletedUser: IUserEventData;
        auditUser: IAuditUser;
    }) {
        super(USER_DELETED, eventData.auditUser);
        this.preData = mapUserToData(eventData.deletedUser);
    }
}

export class ScimUsersDeleted extends BaseEvent {
    readonly data: any;

    constructor(eventData: {
        data: any;
        auditUser: IAuditUser;
    }) {
        super(SCIM_USERS_DELETED, eventData.auditUser);
        this.data = eventData.data;
    }
}

export class ScimGroupsDeleted extends BaseEvent {
    readonly data: any;

    constructor(eventData: {
        data: any;
        auditUser: IAuditUser;
    }) {
        super(SCIM_GROUPS_DELETED, eventData.auditUser);
        this.data = eventData.data;
    }
}

export class TagTypeCreatedEvent extends BaseEvent {
    readonly data: any;

    constructor(eventData: {
        auditUser: IAuditUser;
        data: any;
    }) {
        super('tag-type-created', eventData.auditUser);
        this.data = eventData.data;
    }
}

export class TagTypeDeletedEvent extends BaseEvent {
    readonly preData: any;

    constructor(eventData: {
        auditUser: IAuditUser;
        preData: any;
    }) {
        super(TAG_TYPE_DELETED, eventData.auditUser);
        this.preData = eventData.preData;
    }
}

export class TagTypeUpdatedEvent extends BaseEvent {
    readonly data: any;

    constructor(eventData: {
        auditUser: IAuditUser;
        data: any;
    }) {
        super(TAG_TYPE_UPDATED, eventData.auditUser);
        this.data = eventData.data;
    }
}

export class TagCreatedEvent extends BaseEvent {
    readonly data: any;

    constructor(eventData: {
        auditUser: IAuditUser;
        data: any;
    }) {
        super(TAG_CREATED, eventData.auditUser);
        this.data = eventData.data;
    }
}

export class TagDeletedEvent extends BaseEvent {
    readonly data: any;

    constructor(eventData: {
        auditUser: IAuditUser;
        data: any;
    }) {
        super(TAG_DELETED, eventData.auditUser);
        this.data = eventData.data;
    }
}

export class PatCreatedEvent extends BaseEvent {
    readonly data: any;

    constructor(eventData: {
        auditUser: IAuditUser;
        data: any;
    }) {
        super(PAT_CREATED, eventData.auditUser);
        this.data = eventData.data;
    }
}

export class PatDeletedEvent extends BaseEvent {
    readonly data: any;

    constructor(eventData: {
        auditUser: IAuditUser;
        data: any;
    }) {
        super(PAT_DELETED, eventData.auditUser);
        this.data = eventData.data;
    }
}

export class ProjectEnvironmentAdded extends BaseEvent {
    readonly project: string;
    readonly environment: string;

    constructor(eventData: {
        project: string;
        environment: string;
        auditUser: IAuditUser;
    }) {
        super(PROJECT_ENVIRONMENT_ADDED, eventData.auditUser);
        this.project = eventData.project;
        this.environment = eventData.environment;
    }
}

export class ProjectEnvironmentRemoved extends BaseEvent {
    readonly project: string;
    readonly environment: string;

    constructor(eventData: {
        project: string;
        environment: string;
        auditUser: IAuditUser;
    }) {
        super(PROJECT_ENVIRONMENT_REMOVED, eventData.auditUser);
        this.project = eventData.project;
        this.environment = eventData.environment;
    }
}

export class FeaturesExportedEvent extends BaseEvent {
    readonly data: any;

    constructor(eventData: {
        auditUser: IAuditUser;
        data: any;
    }) {
        super(FEATURES_EXPORTED, eventData.auditUser);
        this.data = eventData;
    }
}

export class DropProjectsEvent extends BaseEvent {
    readonly data: any;

    constructor(eventData: {
        auditUser: IAuditUser;
    }) {
        super(DROP_PROJECTS, eventData.auditUser);
        this.data = { name: 'all-projects' };
    }
}

export class DropFeaturesEvent extends BaseEvent {
    readonly data: any;

    constructor(eventData: {
        auditUser: IAuditUser;
    }) {
        super(DROP_FEATURES, eventData.auditUser);
        this.data = { name: 'all-features' };
    }
}

export class DropStrategiesEvent extends BaseEvent {
    readonly data: any;

    constructor(eventData: {
        auditUser: IAuditUser;
    }) {
        super(DROP_STRATEGIES, eventData.auditUser);
        this.data = { name: 'all-strategies' };
    }
}

export class DropEnvironmentsEvent extends BaseEvent {
    readonly data: any;

    constructor(eventData: {
        auditUser: IAuditUser;
    }) {
        super(DROP_ENVIRONMENTS, eventData.auditUser);
        this.data = { name: 'all-environments' };
    }
}

export class DropFeatureTagsEvent extends BaseEvent {
    readonly data: any;

    constructor(eventData: {
        auditUser: IAuditUser;
    }) {
        super(DROP_FEATURE_TAGS, eventData.auditUser);
        this.data = { name: 'all-feature-tags' };
    }
}

export class DropTagsEvent extends BaseEvent {
    readonly data: any;

    constructor(eventData: {
        auditUser: IAuditUser;
    }) {
        super(DROP_TAGS, eventData.auditUser);
        this.data = { name: 'all-tags' };
    }
}

export class DropTagTypesEvent extends BaseEvent {
    readonly data: any;

    constructor(eventData: {
        auditUser: IAuditUser;
    }) {
        super(DROP_TAG_TYPES, eventData.auditUser);
        this.data = { name: 'all-tag-types' };
    }
}

export class RoleCreatedEvent extends BaseEvent {
    readonly data: any;

    constructor(eventData: {
        data: any;
        auditUser: IAuditUser;
    }) {
        super(ROLE_CREATED, eventData.auditUser);
        this.data = eventData.data;
    }
}

export class RoleDeletedEvent extends BaseEvent {
    readonly preData: any;

    constructor(eventData: {
        preData: any;
        auditUser: IAuditUser;
    }) {
        super(ROLE_DELETED, eventData.auditUser);
        this.preData = eventData.preData;
    }
}

export class StrategyCreatedEvent extends BaseEvent {
    readonly data: any;

    constructor(eventData: {
        data: any;
        auditUser: IAuditUser;
    }) {
        super(STRATEGY_CREATED, eventData.auditUser);
        this.data = eventData.data;
    }
}

export class StrategyUpdatedEvent extends BaseEvent {
    readonly data: any;

    constructor(eventData: {
        data: any;
        auditUser: IAuditUser;
    }) {
        super(STRATEGY_UPDATED, eventData.auditUser);
        this.data = eventData.data;
    }
}

export class StrategyDeletedEvent extends BaseEvent {
    readonly data: any;

    constructor(eventData: {
        data: any;
        auditUser: IAuditUser;
    }) {
        super(STRATEGY_DELETED, eventData.auditUser);
        this.data = eventData.data;
    }
}

export class StrategyDeprecatedEvent extends BaseEvent {
    readonly data: any;

    constructor(eventData: {
        data: any;
        auditUser: IAuditUser;
    }) {
        super(STRATEGY_DEPRECATED, eventData.auditUser);
        this.data = eventData.data;
    }
}

export class StrategyReactivatedEvent extends BaseEvent {
    readonly data: any;

    constructor(eventData: {
        data: any;
        auditUser: IAuditUser;
    }) {
        super(STRATEGY_REACTIVATED, eventData.auditUser);
        this.data = eventData.data;
    }
}

export class DefaultStrategyUpdatedEvent extends BaseEvent {
    readonly project: string;
    readonly environment: string;
    readonly preData: any;
    readonly data: any;

    constructor(eventData: {
        project: string;
        environment: string;
        auditUser: IAuditUser;
        preData: any;
        data: any;
    }) {
        super(DEFAULT_STRATEGY_UPDATED, eventData.auditUser);
        this.data = eventData.data;
        this.preData = eventData.preData;
        this.project = eventData.project;
        this.environment = eventData.environment;
    }
}

export class AddonConfigCreatedEvent extends BaseEvent {
    readonly data: any;

    constructor(eventData: {
        auditUser: IAuditUser;
        data: any;
    }) {
        super(ADDON_CONFIG_CREATED, eventData.auditUser);
        this.data = eventData.data;
    }
}

export class AddonConfigUpdatedEvent extends BaseEvent {
    readonly data: any;
    readonly preData: any;

    constructor(eventData: {
        auditUser: IAuditUser;
        data: any;
        preData: any;
    }) {
        super(ADDON_CONFIG_UPDATED, eventData.auditUser);
        this.data = eventData.data;
        this.preData = eventData.preData;
    }
}

export class AddonConfigDeletedEvent extends BaseEvent {
    readonly preData: any;

    constructor(eventData: {
        auditUser: IAuditUser;
        preData: any;
    }) {
        super(ADDON_CONFIG_DELETED, eventData.auditUser);
        this.preData = eventData.preData;
    }
}

export class SegmentCreatedEvent extends BaseEvent {
    readonly project: string | undefined;
    readonly data: any;

    constructor(eventData: {
        auditUser: IAuditUser;
        project: string | undefined;
        data: any;
    }) {
        super(SEGMENT_CREATED, eventData.auditUser);
        this.project = eventData.project;
        this.data = eventData.data;
    }
}

export class SegmentUpdatedEvent extends BaseEvent {
    readonly data: any;
    readonly preData: any;
    readonly project: string;

    constructor(eventData: {
        auditUser: IAuditUser;
        project: string;
        data: any;
        preData: any;
    }) {
        super(SEGMENT_UPDATED, eventData.auditUser);
        this.project = eventData.project;
        this.data = eventData.data;
        this.preData = eventData.preData;
    }
}

export class SegmentDeletedEvent extends BaseEvent {
    readonly preData: any;
    readonly project?: string;

    constructor(eventData: {
        auditUser: IAuditUser;
        preData: any;
        project?: string;
    }) {
        super(SEGMENT_DELETED, eventData.auditUser);
        this.preData = eventData.preData;
        this.project = eventData.project;
    }
}

export class GroupUpdatedEvent extends BaseEvent {
    readonly preData: any;
    readonly data: any;

    constructor(eventData: {
        data: any;
        preData: any;
        auditUser: IAuditUser;
    }) {
        super(GROUP_UPDATED, eventData.auditUser);
        this.preData = eventData.preData;
        this.data = eventData.data;
    }
}

export class GroupDeletedEvent extends BaseEvent {
    readonly preData: any;

    constructor(eventData: {
        preData: any;
        auditUser: IAuditUser;
    }) {
        super(GROUP_DELETED, eventData.auditUser);
        this.preData = eventData.preData;
    }
}

export class MilestoneProgressionDeletedEvent extends BaseEvent {
    readonly project: string;
    readonly environment: string;
    readonly featureName: string;
    readonly preData: any;
    constructor(eventData: {
        project: string;
        environment: string;
        featureName: string;
        preData: any;
        auditUser: IAuditUser;
    }) {
        super(MILESTONE_PROGRESSION_DELETED, eventData.auditUser);
        this.project = eventData.project;
        this.environment = eventData.environment;
        this.featureName = eventData.featureName;
        this.preData = eventData.preData;
    }
}

export class MilestoneProgressionChangedEvent extends BaseEvent {
    readonly project: string;
    readonly environment: string;
    readonly featureName: string;
    readonly preData: any;
    readonly data: any;
    constructor(eventData: {
        project: string;
        environment: string;
        featureName: string;
        data: any;
        preData?: any;
        auditUser: IAuditUser;
    }) {
        super(MILESTONE_PROGRESSION_CHANGED, eventData.auditUser);
        this.project = eventData.project;
        this.environment = eventData.environment;
        this.featureName = eventData.featureName;
        this.data = eventData.data;
        this.preData = eventData.preData;
    }
}

export class ReleasePlanTemplateCreatedEvent extends BaseEvent {
    readonly data: any;
    constructor(eventData: {
        data: any;
        auditUser: IAuditUser;
    }) {
        super(RELEASE_PLAN_TEMPLATE_CREATED, eventData.auditUser);
        this.data = eventData.data;
    }
}

export class ReleasePlanTemplateUpdatedEvent extends BaseEvent {
    readonly preData: any;
    readonly data: any;
    constructor(eventData: {
        data: any;
        preData: any;
        auditUser: IAuditUser;
    }) {
        super(RELEASE_PLAN_TEMPLATE_UPDATED, eventData.auditUser);
        this.data = eventData.data;
        this.preData = eventData.preData;
    }
}

export class ReleasePlanTemplateDeletedEvent extends BaseEvent {
    readonly preData: any;
    constructor(eventData: {
        preData: any;
        auditUser: IAuditUser;
    }) {
        super(RELEASE_PLAN_TEMPLATE_DELETED, eventData.auditUser);
        this.preData = eventData.preData;
    }
}

export class ReleasePlanTemplateArchivedEvent extends BaseEvent {
    readonly preData: any;
    readonly data: any;
    constructor(eventData: {
        data: any;
        preData: any;
        auditUser: IAuditUser;
    }) {
        super(RELEASE_PLAN_TEMPLATE_ARCHIVED, eventData.auditUser);
        this.data = eventData.data;
        this.preData = eventData.preData;
    }
}

export class ReleasePlanAddedEvent extends BaseEvent {
    readonly project: string;
    readonly featureName: string;
    readonly environment: string;
    readonly data: any;
    constructor(eventData: {
        project: string;
        featureName: string;
        environment: string;
        data: any;
        auditUser: IAuditUser;
    }) {
        super(RELEASE_PLAN_ADDED, eventData.auditUser);
        this.project = eventData.project;
        this.featureName = eventData.featureName;
        this.environment = eventData.environment;
        this.data = eventData.data;
    }
}

export class ReleasePlanRemovedEvent extends BaseEvent {
    readonly project: string;
    readonly featureName: string;
    readonly environment: string;
    readonly preData: any;
    constructor(eventData: {
        project: string;
        featureName: string;
        environment: string;
        preData: any;
        auditUser: IAuditUser;
    }) {
        super(RELEASE_PLAN_REMOVED, eventData.auditUser);
        this.project = eventData.project;
        this.featureName = eventData.featureName;
        this.environment = eventData.environment;
        this.preData = eventData.preData;
    }
}

export class ReleasePlanMilestoneStartedEvent extends BaseEvent {
    readonly project: string;
    readonly featureName: string;
    readonly environment: string;
    readonly preData: any;
    readonly data: any;
    constructor(eventData: {
        project: string;
        featureName: string;
        environment: string;
        preData: any;
        data: any;
        auditUser: IAuditUser;
    }) {
        super(RELEASE_PLAN_MILESTONE_STARTED, eventData.auditUser);
        this.project = eventData.project;
        this.featureName = eventData.featureName;
        this.environment = eventData.environment;
        this.preData = eventData.preData;
        this.data = eventData.data;
    }
}

export class ApplicationCreatedEvent extends BaseEvent {
    readonly data: IClientApplication;
    constructor(eventData: {
        data: IClientApplication;
        auditUser: IAuditUser;
    }) {
        super(APPLICATION_CREATED, eventData.auditUser);
        this.data = eventData.data;
    }
}

interface IUserEventData
    extends Pick<
        IUserWithRootRole,
        'id' | 'name' | 'username' | 'email' | 'rootRole'
    > {}

function mapUserToData(user: IUserEventData): any {
    return {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        rootRole: user.rootRole,
    };
}

export class UserPreferenceUpdatedEvent extends BaseEvent {
    readonly userId;
    readonly data: any;

    constructor(eventData: {
        userId: number;
        data: any;
        auditUser: IAuditUser;
    }) {
        super(USER_PREFERENCE_UPDATED, eventData.auditUser);
        this.userId = eventData.userId;
        this.data = eventData.data;
    }
}
