import { useCallback } from 'react';
import useAPI from '../useApi/useApi';
import type {
    ICreateInvitedUser,
    IPublicSignupTokenCreate,
    IPublicSignupTokenUpdate,
} from 'interfaces/publicSignupTokens';

const URI = 'api/admin/invite-link/tokens';

export const useInviteTokenApi = () => {
    const { makeRequest, createRequest, errors, loading } = useAPI({
        propagateErrors: true,
    });

    const createToken = useCallback(
        async (request: IPublicSignupTokenCreate) => {
            const req = createRequest(URI, {
                method: 'POST',
                body: JSON.stringify(request),
            });

            return await makeRequest(req.caller, req.id);
        },
        [createRequest, makeRequest]
    );

    const updateToken = useCallback(
        async (tokenName: string, value: IPublicSignupTokenUpdate) => {
            const req = createRequest(`${URI}/${tokenName}`, {
                method: 'PUT',
                body: JSON.stringify({
                    ...(value.expiresAt ? { expiresAt: value.expiresAt } : {}),
                    ...(value.enabled !== undefined
                        ? { enabled: value.enabled }
                        : {}),
                }),
            });

            return await makeRequest(req.caller, req.id);
        },
        [createRequest, makeRequest]
    );

    const addUser = useCallback(
        async (secret: string, value: ICreateInvitedUser) => {
            const req = createRequest(`/invite/${secret}/signup`, {
                method: 'POST',
                body: JSON.stringify(value),
            });

            return await makeRequest(req.caller, req.id);
        },
        [createRequest, makeRequest]
    );

    return {
        createToken,
        updateToken,
        addUser,
        errors,
        loading,
    };
};
