import useAPI from '../useApi/useApi.js';
import type {
    AdvancedPlaygroundRequestSchema,
    AdvancedPlaygroundResponseSchema,
    ChangeRequestPlaygroundRequestSchema,
} from 'openapi';

export const usePlaygroundApi = () => {
    const { makeRequest, createRequest, errors, loading } = useAPI({
        propagateErrors: true,
    });

    const URI = 'api/admin/playground';

    const evaluateAdvancedPlayground = async (
        payload: AdvancedPlaygroundRequestSchema,
    ): Promise<AdvancedPlaygroundResponseSchema> => {
        const path = `${URI}/advanced`;
        const req = createRequest(path, {
            method: 'POST',
            body: JSON.stringify(payload),
        });

        const res = await makeRequest(req.caller, req.id);
        return res.json();
    };

    const evaluateChangeRequestPlayground = async (
        changeRequestId: string,
        payload: ChangeRequestPlaygroundRequestSchema,
    ): Promise<AdvancedPlaygroundResponseSchema> => {
        const path = `${URI}/change-request/${changeRequestId}`;
        const req = createRequest(path, {
            method: 'POST',
            body: JSON.stringify(payload),
        });

        const res = await makeRequest(req.caller, req.id);
        return res.json();
    };

    return {
        evaluateAdvancedPlayground,
        evaluateChangeRequestPlayground,
        errors,
        loading,
    };
};
