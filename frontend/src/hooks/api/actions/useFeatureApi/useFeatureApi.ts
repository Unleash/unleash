import { IFeatureToggleDTO } from '../../../../interfaces/featureToggle';
import { ITag } from '../../../../interfaces/tags';
import useAPI from '../useApi/useApi';

const useFeatureApi = () => {
    const { makeRequest, createRequest, errors, loading } = useAPI({
        propagateErrors: true,
    });

    const validateFeatureToggleName = async (
        name: string,
    ) => {
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


    const createFeatureToggle = async (
        projectId: string,
        featureToggle: IFeatureToggleDTO,
    ) => {
        const path = `api/admin/projects/${projectId}/features`;
        const req = createRequest(path, {
            method: 'POST',
            body: JSON.stringify(featureToggle),
        });

        try {
            const res = await makeRequest(req.caller, req.id);

            return res;
        } catch (e) {
            throw e;
        }
    };

    const toggleFeatureEnvironmentOn = async (
        projectId: string,
        featureId: string,
        environmentId: string
    ) => {
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
    };

    const toggleFeatureEnvironmentOff = async (
        projectId: string,
        featureId: string,
        environmentId: string
    ) => {
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
    };

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
        createFeatureToggle,
        changeFeatureProject,
        errors,
        toggleFeatureEnvironmentOn,
        toggleFeatureEnvironmentOff,
        addTagToFeature,
        deleteTagFromFeature,
        archiveFeatureToggle,
        patchFeatureToggle,
        cloneFeatureToggle,
        loading,
    };
};

export default useFeatureApi;
