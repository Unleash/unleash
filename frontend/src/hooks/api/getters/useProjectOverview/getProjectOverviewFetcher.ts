import { formatApiPath } from 'utils/formatPath';
import { createFetcher } from '../useApiGetter/useApiGetter.js';

export const getProjectOverviewFetcher = (id: string) => {
    const fetcher = createFetcher({
        path: formatApiPath(`api/admin/projects/${id}/overview`),
        errorTarget: 'Project overview',
    });

    const KEY = `api/admin/projects/${id}/overview`;

    return {
        fetcher,
        KEY,
    };
};
