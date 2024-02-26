import { ApplicationsSchema } from '../../../../openapi';
import { createPaginatedHook } from '../usePaginatedData/usePaginatedData';

const prefixKey = 'api/admin/metrics/applications?';
const useApplications = createPaginatedHook<ApplicationsSchema>(
    { applications: [], total: 0 },
    prefixKey,
);

export default useApplications;
