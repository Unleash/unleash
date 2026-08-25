import type { UserAccessLogSchema } from 'openapi';
import { createPaginatedHook } from '../usePaginatedData/usePaginatedData.js';

export const DEFAULT_PAGE_LIMIT = 25;

const useParameterizedUserAccessLog = createPaginatedHook<UserAccessLogSchema>(
    {
        items: [],
        total: 0,
    },
    'api/admin/users/access-log?',
);

export const useUserAccessLog = (params: Record<string, any>) =>
    useParameterizedUserAccessLog(params);
