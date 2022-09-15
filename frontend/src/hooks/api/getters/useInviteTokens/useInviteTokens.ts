import useSWR, { SWRConfiguration } from 'swr';
import useQueryParams from 'hooks/useQueryParams';
import { formatApiPath } from 'utils/formatPath';

const url = 'admin/invite-link/tokens';

const fetcher = () => {
    const path = formatApiPath(url);
    return fetch(path, {
        method: 'GET',
    }).then(res => res.json());
};

export const useInviteTokens = (options: SWRConfiguration = {}) => {
    const query = useQueryParams();
    const { data, error } = useSWR(url, fetcher, options);
    const invite = query.get('invite') || '';

    return { data, error, invite, loading: false };
};
