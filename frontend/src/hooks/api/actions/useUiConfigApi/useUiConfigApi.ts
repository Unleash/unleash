import useAPI from '../useApi/useApi.js';

export const useUiConfigApi = () => {
    const { makeRequest, createRequest, errors, loading } = useAPI({
        propagateErrors: true,
    });

    const setCors = async (frontendApiOrigins: string[]): Promise<void> => {
        const req = createRequest(
            'api/admin/ui-config/cors',
            { method: 'POST', body: JSON.stringify({ frontendApiOrigins }) },
            'setCors',
        );
        await makeRequest(req.caller, req.id);
    };

    return {
        setCors,
        loading,
        errors,
    };
};
