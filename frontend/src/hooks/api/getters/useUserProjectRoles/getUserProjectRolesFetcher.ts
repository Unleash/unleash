import { formatApiPath } from '../../../../utils/formatPath.js';
import { createFetcher } from '../useApiGetter/useApiGetter.js';

export const getUserProjectRolesFetcher = (id: string) => {
    const fetcher = createFetcher({
        url: formatApiPath(`api/admin/user/roles?projectId=${id}`),
        errorTarget: 'User Project roles',
    });

    const KEY = `api/admin/projects/${id}/roles`;

    return {
        fetcher,
        KEY,
    };
};
