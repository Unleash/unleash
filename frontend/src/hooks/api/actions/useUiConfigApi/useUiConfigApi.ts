import useAPI from '../useApi/useApi';
import { formatApiPath } from 'utils/formatPath';

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
            formatApiPath('api/admin/ui-config'),
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
