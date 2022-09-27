import { useEffect, useState } from 'react';
import useSWR, { SWRConfiguration } from 'swr';
import {
    PublicSignupTokensSchema,
    PublicSignupTokensSchemaFromJSON,
} from 'openapi';
import { formatApiPath } from 'utils/formatPath';

const url = 'api/admin/invite-link/tokens';

const fetcher = () => {
    const path = formatApiPath(url);
    return fetch(path, {
        method: 'GET',
    })
        .then(res => res.json())
        .then(PublicSignupTokensSchemaFromJSON);
};

export const useInviteTokens = (options: SWRConfiguration = {}) => {
    const { data, error } = useSWR<PublicSignupTokensSchema>(
        url,
        fetcher,
        options
    );
    const [loading, setLoading] = useState(!error && !data);

    useEffect(() => {
        setLoading(!error && !data);
    }, [data, error]);

    return { data, error, loading };
};
