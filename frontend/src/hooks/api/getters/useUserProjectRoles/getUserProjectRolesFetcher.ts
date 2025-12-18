import { formatApiPath } from '../../../../utils/formatPath.js';
import { createFetcher } from '../useApiGetter/useApiGetter.js';

export const getUserProjectRolesFetcher = (id: string) => {
    const fetcher = createFetcher({
        path: formatApiPath(`api/admin/user/roles?projectId=${id}`),
        errorTarget: 'User Project roles',
    });

    const KEY = `api/admin/projects/${id}/roles`;

    return {
        fetcher,
        KEY,
    };
};
