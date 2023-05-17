import { useCallback } from 'react';
import { ITag } from 'interfaces/tags';
import { Operation } from 'fast-json-patch';
import { IConstraint } from 'interfaces/strategy';
import { CreateFeatureSchema, UpdateTagsSchema } from 'openapi';
import useAPI from '../useApi/useApi';
import { IFeatureVariant } from 'interfaces/featureToggle';

const useFeatureApi = () => {
    const { makeRequest, createRequest, errors, loading } = useAPI({
        propagateErrors: true,
    });

    const validateFeatureToggleName = async (name: string | undefined) => {
        const path = `api/admin/features/validate`;
        const req = createRequest(path, {
            method: 'POST',
            body: JSON.stringify({ name }),
        });

        try {
            const res = await makeRequest(req.caller, req.id);

            return res;
        } catch (e) {
            throw e;
        }
    };

    const validateConstraint = async (
        constraint: IConstraint
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
        createFeatureSchema: CreateFeatureSchema
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
            shouldActivateDisabledStrategies = false
        ) => {
            const path = `api/admin/projects/${projectId}/features/${featureId}/environments/${environmentId}/on?shouldActivateDisabledStrategies=${shouldActivateDisabledStrategies}`;
            const req = createRequest(
                path,
                { method: 'POST' },
                'toggleFeatureEnvironmentOn'
            );

            try {
                const res = await makeRequest(req.caller, req.id);

                return res;
            } catch (e) {
                throw e;
            }
        },
        [createRequest, makeRequest]
    );

    const bulkToggleFeaturesEnvironmentOn = useCallback(
        async (
            projectId: string,
            featureIds: string[],
            environmentId: string,
            shouldActivateDisabledStrategies = false
        ) => {
            const path = `api/admin/projects/${projectId}/bulk_features/environments/${environmentId}/on?shouldActivateDisabledStrategies=${shouldActivateDisabledStrategies}`;
            const req = createRequest(
                path,
                {
                    method: 'POST',
                    body: JSON.stringify({ features: featureIds }),
                },
                'bulkToggleFeaturesEnvironmentOn'
            );

            try {
                const res = await makeRequest(req.caller, req.id);

                return res;
            } catch (e) {
                throw e;
            }
        },
        [createRequest, makeRequest]
    );

    const bulkToggleFeaturesEnvironmentOff = useCallback(
        async (
            projectId: string,
            featureIds: string[],
            environmentId: string,
            shouldActivateDisabledStrategies = false
        ) => {
            const path = `api/admin/projects/${projectId}/bulk_features/environments/${environmentId}/off?shouldActivateDisabledStrategies=${shouldActivateDisabledStrategies}`;
            const req = createRequest(
                path,
                {
                    method: 'POST',
                    body: JSON.stringify({ features: featureIds }),
                },
                'bulkToggleFeaturesEnvironmentOff'
            );

            try {
                const res = await makeRequest(req.caller, req.id);

                return res;
            } catch (e) {
                throw e;
            }
        },
        [createRequest, makeRequest]
    );

    const toggleFeatureEnvironmentOff = useCallback(
        async (projectId: string, featureId: string, environmentId: string) => {
            const path = `api/admin/projects/${projectId}/features/${featureId}/environments/${environmentId}/off`;
            const req = createRequest(
                path,
                { method: 'POST' },
                'toggleFeatureEnvironmentOff'
            );

            try {
                const res = await makeRequest(req.caller, req.id);

                return res;
            } catch (e) {
                throw e;
            }
        },
        [createRequest, makeRequest]
    );

    const changeFeatureProject = async (
        projectId: string,
        featureId: string,
        newProjectId: string
    ) => {
        const path = `api/admin/projects/${projectId}/features/${featureId}/changeProject`;
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

    const addTagToFeature = async (featureId: string, tag: ITag) => {
        // TODO: Change this path to the new API when moved.
        const path = `api/admin/features/${featureId}/tags`;
        const req = createRequest(path, {
            method: 'POST',
            body: JSON.stringify({ ...tag }),
        });

        try {
            const res = await makeRequest(req.caller, req.id);

            return res;
        } catch (e) {
            throw e;
        }
    };

    const deleteTagFromFeature = async (
        featureId: string,
        type: string,
        value: string
    ) => {
        // TODO: Change this path to the new API when moved.
        const path = `api/admin/features/${featureId}/tags/${type}/${value}`;
        const req = createRequest(path, {
            method: 'DELETE',
        });

        try {
            const res = await makeRequest(req.caller, req.id);

            return res;
        } catch (e) {
            throw e;
        }
    };

    const updateFeatureTags = async (
        featureId: string,
        update: UpdateTagsSchema
    ) => {
        // TODO: Change this path to the new API when moved.
        const path = `api/admin/features/${featureId}/tags`;
        const req = createRequest(path, {
            method: 'PUT',
            body: JSON.stringify({ ...update }),
        });

        try {
            const res = await makeRequest(req.caller, req.id);

            return res;
        } catch (e) {
            throw e;
        }
    };

    const archiveFeatureToggle = async (
        projectId: string,
        featureId: string
    ) => {
        const path = `api/admin/projects/${projectId}/features/${featureId}`;
        const req = createRequest(path, {
            method: 'DELETE',
        });

        try {
            const res = await makeRequest(req.caller, req.id);

            return res;
        } catch (e) {
            throw e;
        }
    };

    const patchFeatureToggle = async (
        projectId: string,
        featureId: string,
        patchPayload: any
    ) => {
        const path = `api/admin/projects/${projectId}/features/${featureId}`;
        const req = createRequest(path, {
            method: 'PATCH',
            body: JSON.stringify(patchPayload),
        });

        try {
            const res = await makeRequest(req.caller, req.id);

            return res;
        } catch (e) {
            throw e;
        }
    };

    const patchFeatureVariants = async (
        projectId: string,
        featureId: string,
        patchPayload: Operation[]
    ) => {
        const path = `api/admin/projects/${projectId}/features/${featureId}/variants`;
        const req = createRequest(path, {
            method: 'PATCH',
            body: JSON.stringify(patchPayload),
        });

        try {
            const res = await makeRequest(req.caller, req.id);
            return res;
        } catch (e) {
            throw e;
        }
    };

    const patchFeatureEnvironmentVariants = async (
        projectId: string,
        featureId: string,
        environmentName: string,
        patchPayload: Operation[]
    ) => {
        const path = `api/admin/projects/${projectId}/features/${featureId}/environments/${environmentName}/variants`;
        const req = createRequest(path, {
            method: 'PATCH',
            body: JSON.stringify(patchPayload),
        });

        try {
            const res = await makeRequest(req.caller, req.id);
            return res;
        } catch (e) {
            throw e;
        }
    };

    const overrideVariantsInEnvironments = async (
        projectId: string,
        featureId: string,
        variants: IFeatureVariant[],
        environments: string[]
    ) => {
        const put = `api/admin/projects/${projectId}/features/${featureId}/variants-batch`;
        const req = createRequest(put, {
            method: 'PUT',
            body: JSON.stringify({ variants, environments }),
        });

        try {
            const res = await makeRequest(req.caller, req.id);
            return res;
        } catch (e) {
            throw e;
        }
    };

    const cloneFeatureToggle = async (
        projectId: string,
        featureId: string,
        payload: { name: string; replaceGroupId: boolean }
    ) => {
        const path = `api/admin/projects/${projectId}/features/${featureId}/clone`;
        const req = createRequest(path, {
            method: 'POST',
            body: JSON.stringify(payload),
        });

        try {
            const res = await makeRequest(req.caller, req.id);

            return res;
        } catch (e) {
            throw e;
        }
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
        patchFeatureVariants,
        patchFeatureEnvironmentVariants,
        overrideVariantsInEnvironments,
        cloneFeatureToggle,
        loading,
        bulkToggleFeaturesEnvironmentOn,
        bulkToggleFeaturesEnvironmentOff,
    };
};

export default useFeatureApi;
