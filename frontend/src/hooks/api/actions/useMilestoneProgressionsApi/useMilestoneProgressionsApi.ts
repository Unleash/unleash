import useAPI from '../useApi/useApi.js';
import type { ChangeMilestoneProgressionSchema } from 'openapi/models/changeMilestoneProgressionSchema';

export const useMilestoneProgressionsApi = () => {
    const { makeRequest, createRequest, errors, loading } = useAPI({
        propagateErrors: true,
    });

    const changeMilestoneProgression = async (
        projectId: string,
        environment: string,
        featureName: string,
        sourceMilestoneId: string,
        body: ChangeMilestoneProgressionSchema,
    ): Promise<void> => {
        const requestId = 'changeMilestoneProgression';
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

    const resumeMilestoneProgressions = async (
        projectId: string,
        environment: string,
        featureName: string,
        planId: string,
    ): Promise<void> => {
        const requestId = 'resumeProgressions';
        const path = `api/admin/projects/${projectId}/features/${featureName}/environments/${environment}/progressions/${planId}/resume`;
        const req = createRequest(
            path,
            {
                method: 'POST',
            },
            requestId,
        );

        await makeRequest(req.caller, req.id);
    };

    return {
        changeMilestoneProgression,
        deleteMilestoneProgression,
        resumeMilestoneProgressions,
        errors,
        loading,
    };
};
