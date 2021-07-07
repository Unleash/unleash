import useProject from '../../getters/useProject/useProject';
import useAPI from '../useApi/useApi';

const useToggleFeatureByEnv = (projectId: string, name: string) => {
    const { refetch } = useProject(projectId);
    const { makeRequest, createRequest, errors } = useAPI({
        propagateErrors: true,
    });

    const toggleFeatureByEnvironment = async (
        env: string,
        enabled: boolean
    ) => {
        const path = getToggleAPIPath(env, enabled);
        const req = createRequest(path, { method: 'POST' });

        try {
            const res = await makeRequest(req.caller, req.id);
            refetch();
            return res;
        } catch (e) {
            throw e;
        }
    };

    const getToggleAPIPath = (env: string, enabled: boolean) => {
        if (enabled) {
            return `api/admin/projects/${projectId}/features/${name}/environments/${env}/off`;
        }
        return `api/admin/projects/${projectId}/features/${name}/environments/${env}/on`;
    };

    return { toggleFeatureByEnvironment, errors };
};

export default useToggleFeatureByEnv;
