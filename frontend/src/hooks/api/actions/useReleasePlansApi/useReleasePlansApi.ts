import useAPI from '../useApi/useApi.js';
export const useReleasePlansApi = () => {
    const { makeRequest, createRequest } = useAPI({
        propagateErrors: true,
    });

    const addReleasePlanToFeature = async (
        featureName: string,
        releasePlanTemplateId: string,
        projectId: string,
        environment: string,
    ): Promise<void> => {
        const requestId = 'addReleasePlanToFeature';
        const path = `api/admin/projects/${projectId}/features/${featureName}/environments/${environment}/release-plans`;
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

    const removeReleasePlanFromFeature = async (
        projectId: string,
        featureName: string,
        environment: string,
        releasePlanId: string,
    ): Promise<void> => {
        const requestId = 'removeReleasePlanFromFeature';
        const path = `api/admin/projects/${projectId}/features/${featureName}/environments/${environment}/release-plans/${releasePlanId}`;
        const req = createRequest(path, { method: 'DELETE' }, requestId);

        await makeRequest(req.caller, req.id);
    };

    const startReleasePlanMilestone = async (
        projectId: string,
        featureName: string,
        environment: string,
        releasePlanId: string,
        milestoneId: string,
    ): Promise<void> => {
        const requestId = 'startReleasePlanMilestone';
        const path = `api/admin/projects/${projectId}/features/${featureName}/environments/${environment}/release-plans/${releasePlanId}/milestones/${milestoneId}/start`;
        const req = createRequest(path, { method: 'POST' }, requestId);

        await makeRequest(req.caller, req.id);
    };

    return {
        addReleasePlanToFeature,
        removeReleasePlanFromFeature,
        startReleasePlanMilestone,
    };
};
