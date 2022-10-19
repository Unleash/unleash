import { useEffect, useState } from 'react';
import useSWR, { SWRConfiguration } from 'swr';
import { formatApiPath } from 'utils/formatPath';
import { IPublicSignupTokens } from 'interfaces/publicSignupTokens';

export const url = 'api/admin/invite-link/tokens';

const fetcher = () => {
    const path = formatApiPath(url);
    return fetch(path, {
        method: 'GET',
    }).then(res => res.json());
};

export const useInviteTokens = (options: SWRConfiguration = {}) => {
    const { data, error } = useSWR<IPublicSignupTokens>(url, fetcher, options);
    const [loading, setLoading] = useState(!error && !data);

    useEffect(() => {
        setLoading(!error && !data);
    }, [data, error]);

    return {
        data: data
            ? { tokens: data.tokens?.filter(token => token.enabled) }
            : undefined,
        error,
        loading,
    };
};
