import { formatApiPath } from '../../../../utils/format-path';
import handleErrorResponses from '../httpErrorResponseHandler';

export const getProjectFetcher = (id: string) => {
    const fetcher = () => {
        const path = formatApiPath(`api/admin/projects/${id}`);
        return fetch(path, {
            method: 'GET',
        })
            .then(handleErrorResponses('Project overview'))
            .then(res => res.json());
    };

    const KEY = `api/admin/projects/${id}`;

    return {
        fetcher,
        KEY,
    };
};
