import { useCallback } from 'react';
import useAPI from '../useApi/useApi.js';
import { useOptionalPathParam } from 'hooks/useOptionalPathParam';
import { formatIntegrationApiPath } from 'component/integrations/integrationPaths';
import type { AddonSchema } from 'openapi';

const useAddonsApi = () => {
    const { makeRequest, createRequest, errors, loading } = useAPI({
        propagateErrors: true,
    });

    const projectId = useOptionalPathParam('projectId');
    const uri = formatIntegrationApiPath(projectId);

    const createAddon = async (addonConfig: Omit<AddonSchema, 'id'>) => {
        const path = uri;
        const req = createRequest(path, {
            method: 'POST',
            body: JSON.stringify(addonConfig),
        });

        return makeRequest(req.caller, req.id);
    };

    const removeAddon = async (id: number) => {
        const path = `${formatIntegrationApiPath()}/${id}`;
        const req = createRequest(path, {
            method: 'DELETE',
        });

        return makeRequest(req.caller, req.id);
    };

    const updateAddon = useCallback(
        async (addonConfig: AddonSchema) => {
            const path = `${uri}/${addonConfig.id}`;
            const req = createRequest(path, {
                method: 'PUT',
                body: JSON.stringify(addonConfig),
            });

            return makeRequest(req.caller, req.id);
        },
        [createRequest, makeRequest, uri],
    );

    return {
        createAddon,
        updateAddon,
        removeAddon,
        errors,
        loading,
    };
};

export default useAddonsApi;
