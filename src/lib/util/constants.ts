export const DEFAULT_ENV = 'default';

export const ALL_PROJECTS = '*';
export const ALL_ENVS = '*';

export const ROOT_PERMISSION_TYPE = 'root';
export const ENVIRONMENT_PERMISSION_TYPE = 'environment';
export const PROJECT_PERMISSION_TYPE = 'project';

export const CUSTOM_ROLE_TYPE = 'custom';

/* CONTEXT FIELD OPERATORS */

export const NOT_IN = 'NOT_IN';
export const IN = 'IN';
export const STR_ENDS_WITH = 'STR_ENDS_WITH';
export const STR_STARTS_WITH = 'STR_STARTS_WITH';
export const STR_CONTAINS = 'STR_CONTAINS';
export const NUM_EQ = 'NUM_EQ';
export const NUM_GT = 'NUM_GT';
export const NUM_GTE = 'NUM_GTE';
export const NUM_LT = 'NUM_LT';
export const NUM_LTE = 'NUM_LTE';
export const DATE_AFTER = 'DATE_AFTER';
export const DATE_BEFORE = 'DATE_BEFORE';
export const SEMVER_EQ = 'SEMVER_EQ';
export const SEMVER_GT = 'SEMVER_GT';
export const SEMVER_LT = 'SEMVER_LT';

export const ALL_OPERATORS = [
    NOT_IN,
    IN,
    STR_ENDS_WITH,
    STR_STARTS_WITH,
    STR_CONTAINS,
    NUM_EQ,
    NUM_GT,
    NUM_GTE,
    NUM_LT,
    NUM_LTE,
    DATE_AFTER,
    DATE_BEFORE,
    SEMVER_EQ,
    SEMVER_GT,
    SEMVER_LT,
] as const;

export const STRING_OPERATORS = [
    STR_ENDS_WITH,
    STR_STARTS_WITH,
    STR_CONTAINS,
    IN,
    NOT_IN,
];
export const NUM_OPERATORS = [NUM_EQ, NUM_GT, NUM_GTE, NUM_LT, NUM_LTE];
export const DATE_OPERATORS = [DATE_AFTER, DATE_BEFORE];
export const SEMVER_OPERATORS = [SEMVER_EQ, SEMVER_GT, SEMVER_LT];
