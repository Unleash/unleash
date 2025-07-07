import { useCallback } from 'react';
import type { ITag } from 'interfaces/tags';
import type { Operation } from 'fast-json-patch';
import type { IConstraint } from 'interfaces/strategy';
import type { CreateFeatureSchema, UpdateTagsSchema } from 'openapi';
import useAPI from '../useApi/useApi.js';
import type { IFeatureVariant } from 'interfaces/featureToggle';

const useFeatureApi = () => {
    const { makeRequest, makeLightRequest, createRequest, errors, loading } =
        useAPI({
            propagateErrors: true,
        });

    const validateFeatureToggleName = async (
        name: string | undefined,
        project: string | undefined,
    ) => {
        const path = `api/admin/features/validate`;
        const req = createRequest(path, {
            method: 'POST',
            body: JSON.stringify({ name, projectId: project }),
        });

        return makeRequest(req.caller, req.id);
    };

    const validateConstraint = async (
        constraint: IConstraint,
    ): Promise<void> => {
        const path = `api/admin/constraints/validate`;
        const req = createRequest(path, {
            method: 'POST',
            body: JSON.stringify(constraint),
        });
        await makeRequest(req.caller, req.id);
    };

    const createFeatureToggle = async (
        projectId: string,
        createFeatureSchema: CreateFeatureSchema,
    ) => {
        const path = `/api/admin/projects/${projectId}/features`;
        const req = createRequest(path, {
            method: 'POST',
            body: JSON.stringify(createFeatureSchema),
        });
        await makeRequest(req.caller, req.id);
    };

    const toggleFeatureEnvironmentOn = useCallback(
        async (
            projectId: string,
            featureId: string,
            environmentId: string,
            shouldActivateDisabledStrategies = false,
        ) => {
            const path = `api/admin/projects/${projectId}/features/${featureId}/environments/${environmentId}/on?shouldActivateDisabledStrategies=${shouldActivateDisabledStrategies}`;
            const req = createRequest(
                path,
                { method: 'POST' },
                'toggleFeatureEnvironmentOn',
            );

            return makeLightRequest(req.caller, req.id);
        },
        [createRequest, makeLightRequest],
    );

    const bulkToggleFeaturesEnvironmentOn = useCallback(
        async (
            projectId: string,
            featureIds: string[],
            environmentId: string,
            shouldActivateDisabledStrategies = false,
        ) => {
            const path = `api/admin/projects/${projectId}/bulk_features/environments/${environmentId}/on?shouldActivateDisabledStrategies=${shouldActivateDisabledStrategies}`;
            const req = createRequest(
                path,
                {
                    method: 'POST',
                    body: JSON.stringify({ features: featureIds }),
                },
                'bulkToggleFeaturesEnvironmentOn',
            );

            return makeRequest(req.caller, req.id);
        },
        [createRequest, makeRequest],
    );

    const bulkToggleFeaturesEnvironmentOff = useCallback(
        async (
            projectId: string,
            featureIds: string[],
            environmentId: string,
            shouldActivateDisabledStrategies = false,
        ) => {
            const path = `api/admin/projects/${projectId}/bulk_features/environments/${environmentId}/off?shouldActivateDisabledStrategies=${shouldActivateDisabledStrategies}`;
            const req = createRequest(
                path,
                {
                    method: 'POST',
                    body: JSON.stringify({ features: featureIds }),
                },
                'bulkToggleFeaturesEnvironmentOff',
            );

            return makeRequest(req.caller, req.id);
        },
        [createRequest, makeRequest],
    );

    const toggleFeatureEnvironmentOff = useCallback(
        async (projectId: string, featureId: string, environmentId: string) => {
            const path = `api/admin/projects/${projectId}/features/${featureId}/environments/${environmentId}/off`;
            const req = createRequest(
                path,
                { method: 'POST' },
                'toggleFeatureEnvironmentOff',
            );

            return makeLightRequest(req.caller, req.id);
        },
        [createRequest, makeLightRequest],
    );

    const changeFeatureProject = async (
        projectId: string,
        featureId: string,
        newProjectId: string,
    ) => {
        const path = `api/admin/projects/${projectId}/features/${featureId}/changeProject`;
        const req = createRequest(path, {
            method: 'POST',
            body: JSON.stringify({ newProjectId }),
        });

        return makeRequest(req.caller, req.id);
    };

    const addTagToFeature = async (featureId: string, tag: ITag) => {
        // TODO: Change this path to the new API when moved.
        const path = `api/admin/features/${featureId}/tags`;
        const req = createRequest(path, {
            method: 'POST',
            body: JSON.stringify({ ...tag }),
        });

        return makeRequest(req.caller, req.id);
    };

    const deleteTagFromFeature = async (
        featureId: string,
        type: string,
        value: string,
    ) => {
        const encodedTagPath = `${encodeURIComponent(
            type,
        )}/${encodeURIComponent(value)}`;

        // TODO: Change this path to the new API when moved.
        const path = `api/admin/features/${featureId}/tags/${encodedTagPath}`;
        const req = createRequest(path, {
            method: 'DELETE',
        });

        return makeRequest(req.caller, req.id);
    };

    const updateFeatureTags = async (
        featureId: string,
        update: UpdateTagsSchema,
    ) => {
        // TODO: Change this path to the new API when moved.
        const path = `api/admin/features/${featureId}/tags`;
        const req = createRequest(path, {
            method: 'PUT',
            body: JSON.stringify({ ...update }),
        });

        return makeRequest(req.caller, req.id);
    };

    const archiveFeatureToggle = async (
        projectId: string,
        featureId: string,
    ) => {
        const path = `api/admin/projects/${projectId}/features/${featureId}`;
        const req = createRequest(path, {
            method: 'DELETE',
        });

        return makeRequest(req.caller, req.id);
    };

    const patchFeatureToggle = async (
        projectId: string,
        featureId: string,
        patchPayload: any,
    ) => {
        const path = `api/admin/projects/${projectId}/features/${featureId}`;
        const req = createRequest(path, {
            method: 'PATCH',
            body: JSON.stringify(patchPayload),
        });

        return makeRequest(req.caller, req.id);
    };

    const patchFeatureEnvironmentVariants = async (
        projectId: string,
        featureId: string,
        environmentName: string,
        patchPayload: Operation[],
    ) => {
        const path = `api/admin/projects/${projectId}/features/${featureId}/environments/${environmentName}/variants`;
        const req = createRequest(path, {
            method: 'PATCH',
            body: JSON.stringify(patchPayload),
        });

        return makeRequest(req.caller, req.id);
    };

    const overrideVariantsInEnvironments = async (
        projectId: string,
        featureId: string,
        variants: IFeatureVariant[],
        environments: string[],
    ) => {
        const put = `api/admin/projects/${projectId}/features/${featureId}/variants-batch`;
        const req = createRequest(put, {
            method: 'PUT',
            body: JSON.stringify({ variants, environments }),
        });

        return makeRequest(req.caller, req.id);
    };

    const cloneFeatureToggle = async (
        projectId: string,
        featureId: string,
        payload: { name: string; replaceGroupId: boolean },
    ) => {
        const path = `api/admin/projects/${projectId}/features/${featureId}/clone`;
        const req = createRequest(path, {
            method: 'POST',
            body: JSON.stringify(payload),
        });

        return makeRequest(req.caller, req.id);
    };

    return {
        validateFeatureToggleName,
        validateConstraint,
        createFeatureToggle,
        changeFeatureProject,
        errors,
        toggleFeatureEnvironmentOn,
        toggleFeatureEnvironmentOff,
        addTagToFeature,
        deleteTagFromFeature,
        updateFeatureTags,
        archiveFeatureToggle,
        patchFeatureToggle,
        patchFeatureEnvironmentVariants,
        overrideVariantsInEnvironments,
        cloneFeatureToggle,
        loading,
        bulkToggleFeaturesEnvironmentOn,
        bulkToggleFeaturesEnvironmentOff,
    };
};

export default useFeatureApi;
