const REQUEST_TIME = 'request_time';
const DB_TIME = 'db_time';
const FUNCTION_TIME = 'function_time';
const SCHEDULER_JOB_TIME = 'scheduler_job_time';
const FEATURES_CREATED_BY_PROCESSED = 'features_created_by_processed';
const EVENTS_CREATED_BY_PROCESSED = 'events_created_by_processed';
const FRONTEND_API_REPOSITORY_CREATED = 'frontend_api_repository_created';
const PROXY_REPOSITORY_CREATED = 'proxy_repository_created';
const PROXY_FEATURES_FOR_TOKEN_TIME = 'proxy_features_for_token_time';
const STAGE_ENTERED = 'stage-entered' as const;
const EXCEEDS_LIMIT = 'exceeds-limit' as const;

export {
    REQUEST_TIME,
    DB_TIME,
    SCHEDULER_JOB_TIME,
    FUNCTION_TIME,
    FEATURES_CREATED_BY_PROCESSED,
    EVENTS_CREATED_BY_PROCESSED,
    FRONTEND_API_REPOSITORY_CREATED,
    PROXY_REPOSITORY_CREATED,
    PROXY_FEATURES_FOR_TOKEN_TIME,
    STAGE_ENTERED,
    EXCEEDS_LIMIT,
};
