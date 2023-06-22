// Special
export const ADMIN = 'ADMIN';
export const CLIENT = 'CLIENT';
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

export const UPDATE_TAG_TYPE = 'UPDATE_TAG_TYPE';
export const DELETE_TAG_TYPE = 'DELETE_TAG_TYPE';

// Project
export const CREATE_FEATURE = 'CREATE_FEATURE';
export const UPDATE_FEATURE = 'UPDATE_FEATURE';
export const DELETE_FEATURE = 'DELETE_FEATURE';
export const UPDATE_PROJECT = 'UPDATE_PROJECT';
export const DELETE_PROJECT = 'DELETE_PROJECT';
export const UPDATE_FEATURE_VARIANTS = 'UPDATE_FEATURE_VARIANTS';
export const MOVE_FEATURE_TOGGLE = 'MOVE_FEATURE_TOGGLE';
export const READ_PROJECT_API_TOKEN = 'READ_PROJECT_API_TOKEN';
export const CREATE_PROJECT_API_TOKEN = 'CREATE_PROJECT_API_TOKEN';
export const DELETE_PROJECT_API_TOKEN = 'DELETE_PROJECT_API_TOKEN';
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

export const ROOT_PERMISSION_CATEGORIES = [
    {
        label: 'Addon',
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
        permissions: [UPDATE_TAG_TYPE, DELETE_TAG_TYPE],
    },
];
