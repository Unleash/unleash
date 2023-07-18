import useAPI from '../useApi/useApi';
import {
    AdvancedPlaygroundRequestSchema,
    AdvancedPlaygroundResponseSchema,
    PlaygroundRequestSchema,
    PlaygroundResponseSchema,
} from 'openapi';

export const usePlaygroundApi = () => {
    const { makeRequest, createRequest, errors, loading } = useAPI({
        propagateErrors: true,
    });

    const URI = 'api/admin/playground';

    const evaluateAdvancedPlayground = async (
        payload: AdvancedPlaygroundRequestSchema
    ) => {
        const path = `${URI}/advanced`;
        const req = createRequest(path, {
            method: 'POST',
            body: JSON.stringify(payload),
        });

        try {
            const res = await makeRequest(req.caller, req.id);

            return res.json() as Promise<AdvancedPlaygroundResponseSchema>;
        } catch (error) {
            throw error;
        }
    };

    return {
        evaluateAdvancedPlayground,
        errors,
        loading,
    };
};
