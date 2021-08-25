import useAPI from '../useApi/useApi';

const useFeatureApi = () => {
    const { makeRequest, createRequest, errors } = useAPI({
        propagateErrors: true,
    });

    const changeFeatureProject = async (
        projectId: string,
        featureName: string,
        newProjectId: string
    ) => {
        const path = `api/admin/projects/${projectId}/features/${featureName}/changeProject`;
        const req = createRequest(path, {
            method: 'POST',
            body: JSON.stringify({ newProjectId }),
        });

        try {
            const res = await makeRequest(req.caller, req.id);

            return res;
        } catch (e) {
            throw e;
        }
    };

    return { changeFeatureProject, errors };
};

export default useFeatureApi;
