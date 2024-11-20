import useAPI from '../useApi/useApi';
export const useReleasePlansApi = () => {
    const { makeRequest, makeLightRequest, createRequest, errors, loading } =
        useAPI({
            propagateErrors: true,
        });

    const addReleasePlanToFeature = async (
        featureName: string,
        releasePlanTemplateId: string,
        projectId: string,
        environment: string,
    ): Promise<void> => {
        const requestId = 'addReleasePlanToFeature';
        const path = `api/admin/projects/${projectId}/features/${featureName}/environments/${environment}/release_plans`;
        const req = createRequest(
            path,
            {
                method: 'POST',
                body: JSON.stringify({ templateId: releasePlanTemplateId }),
            },
            requestId,
        );

        await makeRequest(req.caller, req.id);
    };

    return {
        addReleasePlanToFeature,
    };
};
