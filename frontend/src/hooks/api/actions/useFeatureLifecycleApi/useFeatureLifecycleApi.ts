import useAPI from '../useApi/useApi';

const useFeatureLifecycleApi = () => {
    const { makeRequest, makeLightRequest, createRequest, errors, loading } =
        useAPI({
            propagateErrors: true,
        });

    const markFeatureCompleted = async (name: string, project: string) => {
        const path = `api/admin/projects/${project}/features/${name}/lifecycle/complete`;
        const req = createRequest(path, {
            method: 'POST',
        });

        return makeRequest(req.caller, req.id);
    };

    return {
        markFeatureCompleted,
        errors,
        loading,
    };
};

export default useFeatureLifecycleApi;
