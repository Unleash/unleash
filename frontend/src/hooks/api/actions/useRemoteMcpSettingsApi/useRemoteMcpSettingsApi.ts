import useAPI from '../useApi/useApi.js';

const ENDPOINT = 'api/admin/remote-mcp/settings';

export const useRemoteMcpSettingsApi = () => {
    const { loading, makeRequest, createRequest, errors } = useAPI({
        propagateErrors: true,
    });

    const setRemoteMcpSettings = async (enabled: boolean): Promise<void> => {
        const req = createRequest(
            ENDPOINT,
            {
                method: 'POST',
                body: JSON.stringify({ enabled }),
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
