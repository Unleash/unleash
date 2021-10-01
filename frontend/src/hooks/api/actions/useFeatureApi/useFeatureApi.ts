import { ITag } from '../../../../interfaces/tags';
import useAPI from '../useApi/useApi';

const useFeatureApi = () => {
    const { makeRequest, createRequest, errors } = useAPI({
        propagateErrors: true,
    });

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

    const addTag = async (featureId: string, tag: ITag) => {
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

    const deleteTag = async (
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

    return {
        changeFeatureProject,
        errors,
        toggleFeatureEnvironmentOn,
        toggleFeatureEnvironmentOff,
        addTag,
        deleteTag,
    };
};

export default useFeatureApi;
