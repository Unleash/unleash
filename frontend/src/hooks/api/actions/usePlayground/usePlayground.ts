import useAPI from '../useApi/useApi';
import {
    AdvancedPlaygroundRequestSchema,
    AdvancedPlaygroundResponseSchema,
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

    return {
        evaluateAdvancedPlayground,
        errors,
        loading,
    };
};
