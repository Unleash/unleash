import { useEffect, useState } from 'react';
import useSWR, { type SWRConfiguration } from 'swr';
import { formatApiPath } from 'utils/formatPath';
import { createFetcher } from '../useApiGetter/useApiGetter.js';
import type { IPublicSignupTokens } from 'interfaces/publicSignupTokens';

export const url = 'api/admin/invite-link/tokens';

const fetcher = createFetcher({
    url: formatApiPath(url),
    errorTarget: 'Invite tokens',
});

export const useInviteTokens = (options: SWRConfiguration = {}) => {
    const { data, error } = useSWR<IPublicSignupTokens>(url, fetcher, options);
    const [loading, setLoading] = useState(!error && !data);

    useEffect(() => {
        setLoading(!error && !data);
    }, [data, error]);

    return {
        data: data
            ? { tokens: data.tokens?.filter((token) => token.enabled) }
            : undefined,
        error,
        loading,
    };
};
