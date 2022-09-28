import { useEffect, useState } from 'react';
import useSWR, { SWRConfiguration } from 'swr';
import useQueryParams from 'hooks/useQueryParams';
import { formatApiPath } from 'utils/formatPath';

const getFetcher = (token: string) => () => {
    if (!token) return Promise.resolve(false);

    return Promise.resolve(true);
    // FIXME: API - validate invite link (response=OK)
    // const path = formatApiPath(`api/admin/invite-link/tokens/${token}/validate`);
    // return fetch(path, {
    //     method: 'GET',
    // })
};

const useUserInvite = (options: SWRConfiguration = {}) => {
    const query = useQueryParams();
    const secret = query.get('invite') || '';
    const url = `api/admin/invite-link/token/${secret}/validate`;
    const { data, error } = useSWR<boolean>(url, getFetcher(secret), options);
    const [loading, setLoading] = useState(!error && !data);
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');

    const addUser = (password: string) => {
        const path = formatApiPath(
            `/api/admin/invite-link/tokens/${secret}/signup`
        );
        const response = fetch(path, {
            headers: {
                'Content-Type': 'application/json',
            },
            method: 'POST',
            body: JSON.stringify({
                username: null,
                email,
                name,
                password,
                rootRole: 0,
                sendEmail: true,
                // TODO: verify request
                // TODO: provide validation feedback to UI
            }),
        });
        // TODO: tooltip confirmation
        return response;
    };

    useEffect(() => {
        setLoading(!error && !data);
    }, [data, error]);

    return {
        secret,
        isValid: data,
        error,
        loading,
        email,
        name,
        setEmail,
        setName,
        addUser,
    };
};

export default useUserInvite;
