import type { IReleasePlan, IReleasePlanMilestoneStrategy } from 'interfaces/releasePlans';
import type { IFeatureStrategyPayload } from 'interfaces/strategy';

import useAPI from '../useApi/useApi.js';
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

    const addMilestoneToReleasePlan = async (
        projectId: string,
        featureName: string,
        environment: string,
        releasePlanId: string,
        milestoneName: string,
    ): Promise<void> => {
        const requestId = 'addMilestoneToReleasePlan';
        const path = `api/admin/projects/${projectId}/features/${featureName}/environments/${environment}/release-plans/${releasePlanId}/milestones`;
        const req = createRequest(
            path,
            {
                method: 'POST',
                body: JSON.stringify({ name: milestoneName }),
            },
            requestId,
        );

        await makeRequest(req.caller, req.id);
    };

    const createReleasePlanWithMilestone = async (
        projectId: string,
        featureName: string,
        environment: string,
        milestoneName: string,
    ): Promise<IReleasePlan> => {
        const requestId = 'createReleasePlanWithMilestone';
        const path = `api/admin/projects/${projectId}/features/${featureName}/environments/${environment}/release-plans/milestone`;
        const req = createRequest(
            path,
            {
                method: 'POST',
                body: JSON.stringify({ name: milestoneName }),
            },
            requestId,
        );

        const response = await makeRequest(req.caller, req.id);
        return response.json();
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

    const addStrategyToMilestone = async (
        projectId: string,
        featureName: string,
        environment: string,
        releasePlanId: string,
        milestoneId: string,
        strategy: IFeatureStrategyPayload,
    ): Promise<IReleasePlanMilestoneStrategy> => {
        const requestId = 'addStrategyToMilestone';
        const path = `api/admin/projects/${projectId}/features/${featureName}/environments/${environment}/release-plans/${releasePlanId}/milestones/${milestoneId}/strategies`;
        const req = createRequest(
            path,
            {
                method: 'POST',
                body: JSON.stringify({
                    strategyName: strategy.name,
                    title: strategy.title,
                    disabled: strategy.disabled,
                    parameters: strategy.parameters,
                    constraints: strategy.constraints,
                    variants: strategy.variants,
                    segments: strategy.segments,
                }),
            },
            requestId,
        );

        const response = await makeRequest(req.caller, req.id);
        return response.json();
    };

    const updateStrategyInMilestone = async (
        projectId: string,
        featureName: string,
        environment: string,
        releasePlanId: string,
        milestoneId: string,
        strategyId: string,
        strategy: IFeatureStrategyPayload,
    ): Promise<IReleasePlanMilestoneStrategy> => {
        const requestId = 'updateStrategyInMilestone';
        const path = `api/admin/projects/${projectId}/features/${featureName}/environments/${environment}/release-plans/${releasePlanId}/milestones/${milestoneId}/strategies/${strategyId}`;
        const req = createRequest(
            path,
            {
                method: 'PUT',
                body: JSON.stringify({
                    strategyName: strategy.name,
                    title: strategy.title,
                    disabled: strategy.disabled,
                    parameters: strategy.parameters,
                    constraints: strategy.constraints,
                    variants: strategy.variants,
                    segments: strategy.segments,
                }),
            },
            requestId,
        );

        const response = await makeRequest(req.caller, req.id);
        return response.json();
    };

    return {
        addReleasePlanToFeature,
        addMilestoneToReleasePlan,
        createReleasePlanWithMilestone,
        removeReleasePlanFromFeature,
        startReleasePlanMilestone,
        addStrategyToMilestone,
        updateStrategyInMilestone,
        loading,
        errors,
    };
};
