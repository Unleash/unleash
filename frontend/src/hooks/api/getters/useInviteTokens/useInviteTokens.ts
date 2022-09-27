import { useEffect, useState } from 'react';
import useSWR, { SWRConfiguration } from 'swr';
import {
    PublicSignupTokensSchema,
    PublicSignupTokensSchemaFromJSON,
} from 'openapi';
import { formatApiPath } from 'utils/formatPath';

export const url = 'api/admin/invite-link/tokens';

const fetcher = () => {
    const path = formatApiPath(url);
    return fetch(path, {
        method: 'GET', // FIXME: POST?
    })
        .then(res => res.json())
        .then(PublicSignupTokensSchemaFromJSON);
};

export const useInviteTokens = (options: SWRConfiguration = {}) => {
    const { data, error, mutate } = useSWR<PublicSignupTokensSchema>(
        url,
        fetcher,
        options
    );
    const [loading, setLoading] = useState(!error && !data);

    useEffect(() => {
        setLoading(!error && !data);
    }, [data, error]);

    return {
        data: data
            ? { tokens: data.tokens.filter(token => token.enabled) }
            : undefined,
        error,
        loading,
    };
};
