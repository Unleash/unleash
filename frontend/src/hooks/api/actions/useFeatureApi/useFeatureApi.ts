import { ITag } from 'interfaces/tags';
import useAPI from '../useApi/useApi';
import { Operation } from 'fast-json-patch';
import { CreateFeatureSchema } from 'openapi';
import { openApiAdmin } from 'utils/openapiClient';
import { IConstraint } from 'interfaces/strategy';
import { useCallback } from 'react';

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
        return openApiAdmin.createFeature({
            projectId,
            createFeatureSchema,
        });
    };

    const toggleFeatureEnvironmentOn = useCallback(
        async (projectId: string, featureId: string, environmentId: string) => {
            const path = `api/admin/projects/${projectId}/features/${featureId}/environments/${environmentId}/on`;
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
        archiveFeatureToggle,
        patchFeatureToggle,
        patchFeatureVariants,
        cloneFeatureToggle,
        loading,
    };
};

export default useFeatureApi;
