import useAPI from '../useApi/useApi.js';
import type { CreateMilestoneProgressionSchema } from 'openapi/models/createMilestoneProgressionSchema';
import type { UpdateMilestoneProgressionSchema } from 'openapi/models/updateMilestoneProgressionSchema';

export const useMilestoneProgressionsApi = () => {
    const { makeRequest, createRequest, errors, loading } = useAPI({
        propagateErrors: true,
    });

    const createMilestoneProgression = async (
        projectId: string,
        environment: string,
        featureName: string,
        body: CreateMilestoneProgressionSchema,
    ): Promise<void> => {
        const requestId = 'createMilestoneProgression';
        const path = `api/admin/projects/${projectId}/features/${featureName}/environments/${environment}/progressions`;
        const req = createRequest(
            path,
            {
                method: 'POST',
                body: JSON.stringify(body),
            },
            requestId,
        );

        await makeRequest(req.caller, req.id);
    };

    const updateMilestoneProgression = async (
        projectId: string,
        environment: string,
        featureName: string,
        sourceMilestoneId: string,
        body: UpdateMilestoneProgressionSchema,
    ): Promise<void> => {
        const requestId = 'updateMilestoneProgression';
        const path = `api/admin/projects/${projectId}/features/${featureName}/environments/${environment}/progressions/${sourceMilestoneId}`;
        const req = createRequest(
            path,
            {
                method: 'PUT',
                body: JSON.stringify(body),
            },
            requestId,
        );

        await makeRequest(req.caller, req.id);
    };

    const deleteMilestoneProgression = async (
        projectId: string,
        environment: string,
        featureName: string,
        sourceMilestoneId: string,
    ): Promise<void> => {
        const requestId = 'deleteMilestoneProgression';
        const path = `api/admin/projects/${projectId}/features/${featureName}/environments/${environment}/progressions/${sourceMilestoneId}`;
        const req = createRequest(
            path,
            {
                method: 'DELETE',
            },
            requestId,
        );

        await makeRequest(req.caller, req.id);
    };

    return {
        createMilestoneProgression,
        updateMilestoneProgression,
        deleteMilestoneProgression,
        errors,
        loading,
    };
};
