// Special
export const ADMIN = 'ADMIN';
export const CLIENT = 'CLIENT'; // TODO data migration needed to change to BACKEND
export const FRONTEND = 'FRONTEND';
export const NONE = 'NONE';

// Root
export const CREATE_ADDON = 'CREATE_ADDON';
export const UPDATE_ADDON = 'UPDATE_ADDON';
export const DELETE_ADDON = 'DELETE_ADDON';

export const UPDATE_CLIENT_API_TOKEN = 'UPDATE_CLIENT_API_TOKEN';
export const CREATE_CLIENT_API_TOKEN = 'CREATE_CLIENT_API_TOKEN';
export const DELETE_CLIENT_API_TOKEN = 'DELETE_CLIENT_API_TOKEN';
export const READ_CLIENT_API_TOKEN = 'READ_CLIENT_API_TOKEN';

export const UPDATE_FRONTEND_API_TOKEN = 'UPDATE_FRONTEND_API_TOKEN';
export const CREATE_FRONTEND_API_TOKEN = 'CREATE_FRONTEND_API_TOKEN';
export const DELETE_FRONTEND_API_TOKEN = 'DELETE_FRONTEND_API_TOKEN';
export const READ_FRONTEND_API_TOKEN = 'READ_FRONTEND_API_TOKEN';

export const UPDATE_APPLICATION = 'UPDATE_APPLICATION';

export const CREATE_CONTEXT_FIELD = 'CREATE_CONTEXT_FIELD';
export const UPDATE_CONTEXT_FIELD = 'UPDATE_CONTEXT_FIELD';
export const DELETE_CONTEXT_FIELD = 'DELETE_CONTEXT_FIELD';

export const CREATE_PROJECT = 'CREATE_PROJECT';

export const READ_ROLE = 'READ_ROLE';

export const CREATE_SEGMENT = 'CREATE_SEGMENT';
export const UPDATE_SEGMENT = 'UPDATE_SEGMENT';
export const DELETE_SEGMENT = 'DELETE_SEGMENT';

export const CREATE_STRATEGY = 'CREATE_STRATEGY';
export const UPDATE_STRATEGY = 'UPDATE_STRATEGY';
export const DELETE_STRATEGY = 'DELETE_STRATEGY';

export const CREATE_TAG_TYPE = 'CREATE_TAG_TYPE';
export const UPDATE_TAG_TYPE = 'UPDATE_TAG_TYPE';
export const DELETE_TAG_TYPE = 'DELETE_TAG_TYPE';

export const READ_LOGS = 'READ_LOGS';
export const UPDATE_MAINTENANCE_MODE = 'UPDATE_MAINTENANCE_MODE';
export const UPDATE_INSTANCE_BANNERS = 'UPDATE_INSTANCE_BANNERS';
export const UPDATE_CORS = 'UPDATE_CORS';
export const UPDATE_AUTH_CONFIGURATION = 'UPDATE_AUTH_CONFIGURATION';

// Project
export const CREATE_FEATURE = 'CREATE_FEATURE';
export const UPDATE_FEATURE = 'UPDATE_FEATURE';
export const UPDATE_FEATURE_DEPENDENCY = 'UPDATE_FEATURE_DEPENDENCY';
export const DELETE_FEATURE = 'DELETE_FEATURE';
export const UPDATE_PROJECT = 'UPDATE_PROJECT';
export const DELETE_PROJECT = 'DELETE_PROJECT';
export const UPDATE_FEATURE_VARIANTS = 'UPDATE_FEATURE_VARIANTS';
export const MOVE_FEATURE_TOGGLE = 'MOVE_FEATURE_TOGGLE';
export const READ_PROJECT_API_TOKEN = 'READ_PROJECT_API_TOKEN';
export const CREATE_PROJECT_API_TOKEN = 'CREATE_PROJECT_API_TOKEN';
export const DELETE_PROJECT_API_TOKEN = 'DELETE_PROJECT_API_TOKEN';
export const UPDATE_PROJECT_CONTEXT = 'UPDATE_PROJECT_CONTEXT';
export const UPDATE_PROJECT_SEGMENT = 'UPDATE_PROJECT_SEGMENT';

export const CREATE_FEATURE_STRATEGY = 'CREATE_FEATURE_STRATEGY';
export const UPDATE_FEATURE_STRATEGY = 'UPDATE_FEATURE_STRATEGY';
export const DELETE_FEATURE_STRATEGY = 'DELETE_FEATURE_STRATEGY';
export const UPDATE_FEATURE_ENVIRONMENT_VARIANTS =
    'UPDATE_FEATURE_ENVIRONMENT_VARIANTS';
export const UPDATE_FEATURE_ENVIRONMENT = 'UPDATE_FEATURE_ENVIRONMENT';
export const APPROVE_CHANGE_REQUEST = 'APPROVE_CHANGE_REQUEST';
export const APPLY_CHANGE_REQUEST = 'APPLY_CHANGE_REQUEST';
export const SKIP_CHANGE_REQUEST = 'SKIP_CHANGE_REQUEST';

export const PROJECT_USER_ACCESS_READ = 'PROJECT_USER_ACCESS_READ';
export const PROJECT_DEFAULT_STRATEGY_READ = 'PROJECT_DEFAULT_STRATEGY_READ';
export const PROJECT_CHANGE_REQUEST_READ = 'PROJECT_CHANGE_REQUEST_READ';
export const PROJECT_SETTINGS_READ = 'PROJECT_SETTINGS_READ';
export const PROJECT_USER_ACCESS_WRITE = 'PROJECT_USER_ACCESS_WRITE';
export const PROJECT_DEFAULT_STRATEGY_WRITE = 'PROJECT_DEFAULT_STRATEGY_WRITE';
export const PROJECT_CHANGE_REQUEST_WRITE = 'PROJECT_CHANGE_REQUEST_WRITE';
export const PROJECT_SETTINGS_WRITE = 'PROJECT_SETTINGS_WRITE';

export const RELEASE_PLAN_TEMPLATE_CREATE = 'RELEASE_PLAN_TEMPLATE_CREATE';
export const RELEASE_PLAN_TEMPLATE_UPDATE = 'RELEASE_PLAN_TEMPLATE_UPDATE';
export const RELEASE_PLAN_TEMPLATE_DELETE = 'RELEASE_PLAN_TEMPLATE_DELETE';

export const ROOT_PERMISSION_CATEGORIES = [
    {
        label: 'Integration',
        permissions: [CREATE_ADDON, UPDATE_ADDON, DELETE_ADDON],
    },
    {
        label: 'API token',
        permissions: [
            UPDATE_CLIENT_API_TOKEN,
            CREATE_CLIENT_API_TOKEN,
            DELETE_CLIENT_API_TOKEN,
            READ_CLIENT_API_TOKEN,
            UPDATE_FRONTEND_API_TOKEN,
            CREATE_FRONTEND_API_TOKEN,
            DELETE_FRONTEND_API_TOKEN,
            READ_FRONTEND_API_TOKEN,
        ],
    },
    {
        label: 'Application',
        permissions: [UPDATE_APPLICATION],
    },
    {
        label: 'Context field',
        permissions: [
            CREATE_CONTEXT_FIELD,
            UPDATE_CONTEXT_FIELD,
            DELETE_CONTEXT_FIELD,
        ],
    },
    {
        label: 'Project',
        permissions: [CREATE_PROJECT],
    },
    {
        label: 'Role',
        permissions: [READ_ROLE],
    },
    {
        label: 'Segment',
        permissions: [CREATE_SEGMENT, UPDATE_SEGMENT, DELETE_SEGMENT],
    },
    {
        label: 'Strategy',
        permissions: [CREATE_STRATEGY, UPDATE_STRATEGY, DELETE_STRATEGY],
    },
    {
        label: 'Tag type',
        permissions: [CREATE_TAG_TYPE, UPDATE_TAG_TYPE, DELETE_TAG_TYPE],
    },
    {
        label: 'Release plan templates',
        permissions: [
            RELEASE_PLAN_TEMPLATE_CREATE,
            RELEASE_PLAN_TEMPLATE_DELETE,
            RELEASE_PLAN_TEMPLATE_UPDATE,
        ],
    },
    {
        label: 'Instance maintenance',
        permissions: [
            READ_LOGS,
            UPDATE_MAINTENANCE_MODE,
            UPDATE_INSTANCE_BANNERS,
            UPDATE_CORS,
        ],
    },
    {
        label: 'Authentication',
        permissions: [UPDATE_AUTH_CONFIGURATION],
    },
];

// Used on Frontend, to allow admin panel use for users with custom root roles
export const MAINTENANCE_MODE_PERMISSIONS = [
    ADMIN,
    READ_ROLE,
    READ_CLIENT_API_TOKEN,
    READ_FRONTEND_API_TOKEN,
    UPDATE_MAINTENANCE_MODE,
    READ_LOGS,
];

export type ProjectPermissionCategory = {
    label: string;
    permissions: Array<[string, string?]>; // [permission, is subset of]
};

export const PROJECT_PERMISSIONS_STRUCTURE: ProjectPermissionCategory[] = [
    {
        label: 'Features and strategies',
        permissions: [
            [CREATE_FEATURE],
            [UPDATE_FEATURE],
            [UPDATE_FEATURE_DEPENDENCY],
            [DELETE_FEATURE],
            [UPDATE_FEATURE_VARIANTS],
            [MOVE_FEATURE_TOGGLE],
            [CREATE_FEATURE_STRATEGY],
            [UPDATE_FEATURE_STRATEGY],
            [DELETE_FEATURE_STRATEGY],
            [UPDATE_FEATURE_ENVIRONMENT],
            [UPDATE_FEATURE_ENVIRONMENT_VARIANTS],
            [UPDATE_PROJECT_SEGMENT],
        ],
    },
    {
        label: 'Project settings',
        permissions: [
            [UPDATE_PROJECT],
            [PROJECT_USER_ACCESS_READ, UPDATE_PROJECT],
            [PROJECT_USER_ACCESS_WRITE, UPDATE_PROJECT],
            [PROJECT_DEFAULT_STRATEGY_READ, UPDATE_PROJECT],
            [PROJECT_DEFAULT_STRATEGY_WRITE, UPDATE_PROJECT],
            [PROJECT_SETTINGS_READ, UPDATE_PROJECT],
            [PROJECT_SETTINGS_WRITE, UPDATE_PROJECT],
            [DELETE_PROJECT],
        ],
    },
    {
        label: 'API tokens',
        permissions: [
            [READ_PROJECT_API_TOKEN],
            [CREATE_PROJECT_API_TOKEN],
            [DELETE_PROJECT_API_TOKEN],
        ],
    },
    {
        label: 'Change requests',
        permissions: [
            [PROJECT_CHANGE_REQUEST_WRITE, UPDATE_PROJECT],
            [PROJECT_CHANGE_REQUEST_READ, UPDATE_PROJECT],
        ],
    },
];
