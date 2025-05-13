import useAPI from '../useApi/useApi.js';
import type { ScimSettings } from 'hooks/api/getters/useScimSettings/useScimSettings';

const ENDPOINT = 'api/admin/scim-settings';

export type ScimSettingsPayload = Omit<ScimSettings, 'hasToken'>;

export const useScimSettingsApi = () => {
    const { loading, makeRequest, createRequest, errors } = useAPI({
        propagateErrors: true,
    });

    const saveSettings = async (scimSettings: ScimSettingsPayload) => {
        const requestId = 'saveSettings';
        const req = createRequest(
            ENDPOINT,
            {
                method: 'POST',
                body: JSON.stringify(scimSettings),
            },
            requestId,
        );

        await makeRequest(req.caller, req.id);
    };

    const generateNewToken = async (): Promise<string> => {
        const requestId = 'generateNewToken';
        const req = createRequest(
            `${ENDPOINT}/generate-new-token`,
            {
                method: 'POST',
            },
            requestId,
        );

        const response = await makeRequest(req.caller, req.id);
        const { token } = await response.json();
        return token;
    };

    return {
        saveSettings,
        generateNewToken,
        errors,
        loading,
    };
};
