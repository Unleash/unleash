import { useCallback } from 'react';
import useAPI from '../useApi/useApi.js';
import { integrationActionsApiPath } from 'component/integrations/integrationPaths';

export const useIntegrationConnectionApi = () => {
    const { makeRequest, createRequest } = useAPI({
        propagateErrors: true,
    });

    const completeConnection = useCallback(
        async (
            providerId: string,
            result: Record<string, string>,
        ): Promise<{ path: string }> => {
            const req = createRequest(
                `${integrationActionsApiPath}/${providerId}/callback`,
                {
                    method: 'POST',
                    body: JSON.stringify(result),
                },
            );

            const res = await makeRequest(req.caller, req.id);
            return res.json();
        },
        [createRequest, makeRequest],
    );

    return { completeConnection };
};
