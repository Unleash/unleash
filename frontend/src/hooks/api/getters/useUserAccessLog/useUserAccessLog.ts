import type { GetUsersAccessLogParams, UserAccessLogSchema } from 'openapi';
import { createPaginatedHook } from '../usePaginatedData/usePaginatedData.js';

export const DEFAULT_PAGE_LIMIT = 25;

const SWR_CACHE_SIZE = 10;

const useParameterizedUserAccessLog = createPaginatedHook<UserAccessLogSchema>(
    {
        items: [],
        total: 0,
    },
    'api/admin/users/access-log?',
    SWR_CACHE_SIZE,
);

export const useUserAccessLog = (params: GetUsersAccessLogParams) =>
    useParameterizedUserAccessLog(params);
