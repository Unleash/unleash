import useAPI from '../useApi/useApi.js';
import type { RemoteMcpSettings } from 'hooks/api/getters/useRemoteMcpSettings/useRemoteMcpSettings';

const ENDPOINT = 'api/admin/remote-mcp/settings';

export const useRemoteMcpSettingsApi = () => {
    const { loading, makeRequest, createRequest, errors } = useAPI({
        propagateErrors: true,
    });

    const setRemoteMcpSettings = async (
        settings: RemoteMcpSettings,
    ): Promise<void> => {
        const req = createRequest(
            ENDPOINT,
            {
                method: 'POST',
                body: JSON.stringify(settings),
            },
            'setRemoteMcpSettings',
        );

        await makeRequest(req.caller, req.id);
    };

    return {
        setRemoteMcpSettings,
        errors,
        loading,
    };
};
