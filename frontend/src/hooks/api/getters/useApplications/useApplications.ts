import type { ApplicationsSchema } from '../../../../openapi.js';
import { createPaginatedHook } from '../usePaginatedData/usePaginatedData.js';

const prefixKey = 'api/admin/metrics/applications?';
const useApplications = createPaginatedHook<ApplicationsSchema>(
    { applications: [], total: 0 },
    prefixKey,
);

export default useApplications;
