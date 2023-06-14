import useAPI from '../useApi/useApi';
import {
    PlaygroundRequestSchema,
    PlaygroundResponseSchema,
} from '../../../../openapi';
import { AdvancedPlaygroundResponse } from '../../../../component/playground/Playground/AdvancedPlaygroundResultsTable/advancedPlayground';

export const usePlaygroundApi = () => {
    const { makeRequest, createRequest, errors, loading } = useAPI({
        propagateErrors: true,
    });

    const URI = 'api/admin/playground';

    const evaluatePlayground = async (payload: PlaygroundRequestSchema) => {
        const req = createRequest(URI, {
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

    const evaluateAdvancedPlayground = async (payload: any) => {
        const path = `${URI}/advanced`;
        const req = createRequest(path, {
            method: 'POST',
            body: JSON.stringify(payload),
        });

        try {
            const res = await makeRequest(req.caller, req.id);

            return res.json() as Promise<AdvancedPlaygroundResponse>;
        } catch (error) {
            throw error;
        }
    };

    return {
        evaluatePlayground,
        evaluateAdvancedPlayground,
        errors,
        loading,
    };
};
