import useAPI from '../useApi/useApi';

export const useUiConfigApi = () => {
    const { makeRequest, createRequest, errors, loading } = useAPI({
        propagateErrors: true,
    });

    const setFrontendSettings = async (
        frontendApiOrigins: string[]
    ): Promise<void> => {
        const payload = {
            frontendSettings: { frontendApiOrigins },
        };
        const req = createRequest(
            'api/admin/ui-config',
            { method: 'POST', body: JSON.stringify(payload) },
            'setFrontendSettings'
        );
        await makeRequest(req.caller, req.id);
    };

    return {
        setFrontendSettings,
        loading,
        errors,
    };
};
