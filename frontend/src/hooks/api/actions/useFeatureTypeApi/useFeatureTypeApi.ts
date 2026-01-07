import type {
    FeatureTypeSchema,
    UpdateFeatureTypeLifetimeSchema,
} from 'openapi';
import useAPI from '../useApi/useApi.js';

export const useFeatureTypeApi = () => {
    const { makeRequest, createRequest, errors, loading } = useAPI({
        propagateErrors: true,
    });

    const updateFeatureTypeLifetime = async (
        featureTypeId: FeatureTypeSchema['id'],
        lifetimeDays: UpdateFeatureTypeLifetimeSchema['lifetimeDays'],
    ) => {
        const payload: UpdateFeatureTypeLifetimeSchema = {
            lifetimeDays,
        };

        const path = `api/admin/feature-types/${featureTypeId}/lifetime`;
        const req = createRequest(path, {
            method: 'PUT',
            body: JSON.stringify(payload),
        });

        await makeRequest(req.caller, req.id);
    };

    return {
        updateFeatureTypeLifetime,
        errors,
        loading,
    };
};
