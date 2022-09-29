import { useCallback } from 'react';
import { useSWRConfig } from 'swr';
import {
    PublicSignupTokenCreateSchema,
    PublicSignupTokenCreateSchemaToJSON,
    PublicSignupTokenUpdateSchema,
} from 'openapi';
import { url as revalidateUrl } from 'hooks/api/getters/useInviteTokens/useInviteTokens';
import useAPI from '../useApi/useApi';
import { CreateInvitedUserSchema } from 'openapi/models/CreateInvitedUserSchema';

const URI = 'api/admin/invite-link/tokens';

export const useInviteTokenApi = () => {
    const { makeRequest, createRequest, errors, loading } = useAPI({
        propagateErrors: true,
    });
    const { mutate } = useSWRConfig();

    const createToken = useCallback(
        async (request: PublicSignupTokenCreateSchema) => {
            const req = createRequest(URI, {
                method: 'POST',
                body: JSON.stringify(
                    PublicSignupTokenCreateSchemaToJSON(request)
                ),
            });

            const response = await makeRequest(req.caller, req.id);
            mutate(revalidateUrl);
            return response;
        },
        [createRequest, makeRequest]
    );

    const updateToken = useCallback(
        async (tokenName: string, value: PublicSignupTokenUpdateSchema) => {
            const req = createRequest(`${URI}/${tokenName}`, {
                method: 'PUT',
                body: JSON.stringify({
                    ...(value.expiresAt
                        ? { expiresAt: value.expiresAt.toISOString() }
                        : {}),
                    ...(value.enabled !== undefined
                        ? { enabled: value.enabled }
                        : {}),
                }),
            });

            const response = await makeRequest(req.caller, req.id);
            mutate(revalidateUrl);
            return response;
        },
        [createRequest, makeRequest]
    );

    const addUser = useCallback(
        async (secret: string, value: CreateInvitedUserSchema) => {
            const req = createRequest(`/invite/${secret}/signup`, {
                method: 'POST',
                body: JSON.stringify(value),
            });

            const response = await makeRequest(req.caller, req.id);
            mutate(revalidateUrl);
            return response;
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
