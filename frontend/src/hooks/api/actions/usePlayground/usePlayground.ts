import useAPI from '../useApi/useApi';
import {
    PlaygroundRequestSchema,
    PlaygroundResponseSchema,
} from '../../../../component/playground/Playground/interfaces/playground.model';

export const usePlaygroundApi = () => {
    const { makeRequest, createRequest, errors, loading } = useAPI({
        propagateErrors: true,
    });

    const URI = 'api/admin/playground';

    const evaluatePlayground = async (payload: PlaygroundRequestSchema) => {
        const path = URI;
        const req = createRequest(path, {
            method: 'POST',
            body: JSON.stringify(payload),
        });

        try {
            const res = await makeRequest(req.caller, req.id);

            return res.json() as Promise<PlaygroundResponseSchema>;
        } catch (error) {
            throw error;
        }
    };

    return {
        evaluatePlayground,
        errors,
        loading,
    };
};
