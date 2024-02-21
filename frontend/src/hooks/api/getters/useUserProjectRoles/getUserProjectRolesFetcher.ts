import { formatApiPath } from '../../../../utils/formatPath';
import handleErrorResponses from '../httpErrorResponseHandler';

export const getUserProjectRolesFetcher = (id: string) => {
    const fetcher = () => {
        const path = formatApiPath(`api/admin/user/roles?projectId=${id}`);
        return fetch(path, {
            method: 'GET',
        })
            .then(handleErrorResponses('User Project roles'))
            .then((res) => res.json());
    };

    const KEY = `api/admin/projects/${id}/roles`;

    return {
        fetcher,
        KEY,
    };
};
