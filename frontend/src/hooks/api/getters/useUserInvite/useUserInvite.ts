import useSWR, { SWRConfiguration } from 'swr';
import useQueryParams from 'hooks/useQueryParams';
import { formatApiPath } from 'utils/formatPath';

const getFetcher = (token: string) => () => {
    const path = formatApiPath(`api/admin/invite-link/tokens/${token}/validate`);
    return fetch(path, {
        method: 'GET',
    }).then(res => res.json());
};

const useUserInvite = (options: SWRConfiguration = {}) => {
    const query = useQueryParams();
    const secret = query.get('invite') || '';
    const url = `api/admin/invite-link/token/${secret}/validate`;
    const { data, error } = useSWR(url, getFetcher(url), options);

    const addUser = () => {};

    return { addUser, secret, data, error };
};

export default useUserInvite;
