import useAPI from '../useApi/useApi';

export const useFeatureArchiveApi = () => {
    const { makeRequest, createRequest, errors, loading } = useAPI({
        propagateErrors: true,
    });

    const reviveFeature = async (feature: string) => {
        const path = `api/admin/archive/revive/${feature}`;
        const req = createRequest(path, { method: 'POST' });
        return makeRequest(req.caller, req.id);
    };

    return { reviveFeature, errors, loading };
};
