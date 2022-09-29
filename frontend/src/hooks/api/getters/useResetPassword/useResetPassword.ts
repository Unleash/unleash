import useSWR, { SWRConfiguration } from 'swr';
import useQueryParams from 'hooks/useQueryParams';
import { useState, useEffect } from 'react';
import { formatApiPath } from 'utils/formatPath';

const getFetcher = (token: string) => () => {
    if (!token) return Promise.resolve({ name: INVALID_TOKEN_ERROR });
    const path = formatApiPath(`auth/reset/validate?token=${token}`);
    // Don't use handleErrorResponses here, because we need to read the error.
    return fetch(path, {
        method: 'GET',
    }).then(res => res.json());
};

export const INVALID_TOKEN_ERROR = 'InvalidTokenError';
const USED_TOKEN_ERROR = 'UsedTokenError';

const useResetPassword = (options: SWRConfiguration = {}) => {
    const query = useQueryParams();
    const initialToken = query.get('token') || '';
    const [token, setToken] = useState(initialToken);

    const fetcher = getFetcher(token);

    const key = `auth/reset/validate?token=${token}`;
    const { data, error } = useSWR(key, fetcher, options);
    const [loading, setLoading] = useState(!error && !data);

    const retry = () => {
        const token = query.get('token') || '';
        setToken(token);
    };

    useEffect(() => {
        setLoading(!error && !data);
    }, [data, error]);

    const isValidToken =
        (!loading && data?.name === INVALID_TOKEN_ERROR) ||
        data?.name === USED_TOKEN_ERROR
            ? false
            : true;

    return {
        token,
        data,
        error,
        loading,
        isValidToken,
        setLoading,
        retry,
    };
};

export default useResetPassword;
