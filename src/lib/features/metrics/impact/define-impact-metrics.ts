import type { IFlagResolver } from '../../../types/index.js';

export const FEAUTRE_LINK_COUNT = 'feature_link_count';
export const CLIENT_ERROR_COUNT = 'client_error_count';
export const SERVER_ERROR_COUNT = 'server_error_count';
export const REQUEST_COUNT = 'request_count';
export const HEAP_MEMORY_TOTAL = 'heap_memory_total';
export const REQUEST_TIME_MS = 'request_time_ms';
export const SCHEDULER_JOB_TIME_SECONDS = 'scheduler_job_time_seconds';

export const defineImpactMetrics = (flagResolver: IFlagResolver) => {
    flagResolver.impactMetrics?.defineCounter(
        FEAUTRE_LINK_COUNT,
        'Count of feature links',
    );
    flagResolver.impactMetrics?.defineCounter(
        CLIENT_ERROR_COUNT,
        'Count of 4xx errors',
    );
    flagResolver.impactMetrics?.defineCounter(
        SERVER_ERROR_COUNT,
        'Count of 5xx errors',
    );
    flagResolver.impactMetrics?.defineCounter(
        REQUEST_COUNT,
        'Count of all requests',
    );
    flagResolver.impactMetrics?.defineGauge(
        HEAP_MEMORY_TOTAL,
        'Total heap memory used by the application process',
    );
    flagResolver.impactMetrics?.defineHistogram(
        REQUEST_TIME_MS,
        'Request handling time',
        [10, 25, 50, 100, 200, 500, 1000, 2000, 5000],
    );
    flagResolver.impactMetrics?.defineHistogram(
        SCHEDULER_JOB_TIME_SECONDS,
        'Job execution time',
        [1, 2, 3, 4, 5, 7, 10, 15, 20, 30, 45, 60, 120],
    );
};
