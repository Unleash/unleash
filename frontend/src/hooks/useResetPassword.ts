import useSWR from 'swr';
import useQueryParams from './useQueryParams';
import { useState, useEffect } from 'react';

const getFetcher = (token: string) => () =>
    fetch(`auth/reset/validate?token=${token}`, {
        method: 'GET',
    }).then(res => res.json());

const INVALID_TOKEN_ERROR = 'InvalidTokenError';
const USED_TOKEN_ERROR = 'UsedTokenError';

const useResetPassword = () => {
    const query = useQueryParams();
    const initialToken = query.get('token') || '';
    const [token, setToken] = useState(initialToken);

    const fetcher = getFetcher(token);
    const { data, error } = useSWR(
        `auth/reset/validate?token=${token}`,
        fetcher
    );
    const [loading, setLoading] = useState(!error && !data);

    const retry = () => {
        const token = query.get('token') || '';
        setToken(token);
    };

    useEffect(() => {
        setLoading(!error && !data);
    }, [data, error]);

    const invalidToken =
        (!loading && data?.name === INVALID_TOKEN_ERROR) ||
        data?.name === USED_TOKEN_ERROR;

    return { token, data, error, loading, setLoading, invalidToken, retry };
};

export default useResetPassword;
