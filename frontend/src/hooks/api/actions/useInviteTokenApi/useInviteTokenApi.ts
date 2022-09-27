import { useCallback } from 'react';
import {
    PublicSignupTokenCreateSchema,
    PublicSignupTokenCreateSchemaToJSON,
} from 'openapi';
import useAPI from '../useApi/useApi';

const URI = 'api/admin/invite-link/tokens';

export const useInviteTokenApi = () => {
    const { makeRequest, createRequest, errors, loading } = useAPI({
        propagateErrors: true,
    });

    const createToken = useCallback(
        async (request: PublicSignupTokenCreateSchema) => {
            const req = createRequest(URI, {
                method: 'POST',
                body: JSON.stringify(
                    PublicSignupTokenCreateSchemaToJSON(request)
                ),
            });

            return makeRequest(req.caller, req.id);
        },
        [createRequest, makeRequest]
    );

    const updateToken = useCallback(
        async (tokenName: string, expiresAt: Date) => {
            const req = createRequest(`${URI}/${tokenName}`, {
                method: 'PUT',
                body: JSON.stringify({ expiresAt: expiresAt.toISOString() }),
            });

            return makeRequest(req.caller, req.id);
        },
        [createRequest, makeRequest]
    );

    const deleteToken = useCallback(
        async (tokenName: string) => {
            const req = createRequest(`${URI}/${tokenName}`, {
                method: 'DELETE',
            });

            return makeRequest(req.caller, req.id);
        },
        [createRequest, makeRequest]
    );

    return {
        createToken,
        updateToken,
        deleteToken,
        errors,
        loading,
    };
};
