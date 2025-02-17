import useAPI from '../useApi/useApi';

export const useUiConfigApi = () => {
    const { makeRequest, createRequest, errors, loading } = useAPI({
        propagateErrors: true,
    });

    /**
     * @deprecated remove when `granularAdminPermissions` flag is removed
     */
    const setFrontendSettings = async (
        frontendApiOrigins: string[],
    ): Promise<void> => {
        const payload = {
            frontendSettings: { frontendApiOrigins },
        };
        const req = createRequest(
            'api/admin/ui-config',
            { method: 'POST', body: JSON.stringify(payload) },
            'setFrontendSettings',
        );
        await makeRequest(req.caller, req.id);
    };

    const setCors = async (frontendApiOrigins: string[]): Promise<void> => {
        const req = createRequest(
            'api/admin/ui-config/cors',
            { method: 'POST', body: JSON.stringify({ frontendApiOrigins }) },
            'setCors',
        );
        await makeRequest(req.caller, req.id);
    };

    return {
        setFrontendSettings,
        setCors,
        loading,
        errors,
    };
};
