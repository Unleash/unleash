import useAPI from '../useApi/useApi.js';
import type { FeatureLifecycleCompletedSchema } from 'openapi';

const useFeatureLifecycleApi = () => {
    const { makeRequest, makeLightRequest, createRequest, errors, loading } =
        useAPI({
            propagateErrors: true,
        });

    const markFeatureCompleted = async (
        name: string,
        project: string,
        status: FeatureLifecycleCompletedSchema,
    ) => {
        const path = `api/admin/projects/${project}/features/${name}/lifecycle/complete`;
        const req = createRequest(path, {
            method: 'POST',
            body: JSON.stringify(status),
        });

        return makeRequest(req.caller, req.id);
    };

    const markFeatureUncompleted = async (name: string, project: string) => {
        const path = `api/admin/projects/${project}/features/${name}/lifecycle/uncomplete`;
        const req = createRequest(path, {
            method: 'POST',
        });

        return makeRequest(req.caller, req.id);
    };

    return {
        markFeatureCompleted,
        markFeatureUncompleted,
        errors,
        loading,
    };
};

export default useFeatureLifecycleApi;
