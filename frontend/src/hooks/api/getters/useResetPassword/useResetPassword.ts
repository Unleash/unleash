import useSWR, { SWRConfiguration } from 'swr';
import useQueryParams from '../../../useQueryParams';
import { useState, useEffect } from 'react';
import { formatApiPath } from '../../../../utils/format-path';
import handleErrorResponses from '../httpErrorResponseHandler';

const getFetcher = (token: string) => () => {
    const path = formatApiPath(`auth/reset/validate?token=${token}`);
    return fetch(path, {
        method: 'GET',
    })
        .then(handleErrorResponses('Password reset'))
        .then(res => res.json());
};

const INVALID_TOKEN_ERROR = 'InvalidTokenError';
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

    const invalidToken =
        (!loading && data?.name === INVALID_TOKEN_ERROR) ||
        data?.name === USED_TOKEN_ERROR;

    return { token, data, error, loading, setLoading, invalidToken, retry };
};

export default useResetPassword;
