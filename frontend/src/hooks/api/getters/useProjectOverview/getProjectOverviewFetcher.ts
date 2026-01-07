import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from '../httpErrorResponseHandler.js';

export const getProjectOverviewFetcher = (id: string) => {
    const fetcher = () => {
        const path = formatApiPath(`api/admin/projects/${id}/overview`);
        return fetch(path, {
            method: 'GET',
        })
            .then(handleErrorResponses('Project overview'))
            .then((res) => res.json());
    };

    const KEY = `api/admin/projects/${id}/overview`;

    return {
        fetcher,
        KEY,
    };
};
