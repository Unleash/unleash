import useAPI from '../useApi/useApi';

const useProjectApi = () => {
    const { makeRequest, createRequest, errors } = useAPI({
        propagateErrors: true,
    });

    const deleteProject = async (projectId: string) => {
        const path = `api/admin/projects/${projectId}`;
        const req = createRequest(path, { method: 'DELETE' });

        try {
            const res = await makeRequest(req.caller, req.id);

            return res;
        } catch (e) {
            throw e;
        }
    };

    const addEnvironmentToProject = async (projectId: string, environment: string) => {
        const path = `api/admin/projects/${projectId}/environments`;
        const req = createRequest(path, {
            method: 'POST',
            body: JSON.stringify({ environment }),
        });

        try {
            const res = await makeRequest(req.caller, req.id);

            return res;
        } catch (e) {
            throw e;
        }
    }

    const removeEnvironmentFromProject = async (projectId: string, environment: string) => {
        const path = `api/admin/projects/${projectId}/environments/${environment}`;
        const req = createRequest(path, { method: 'DELETE' });

        try {
            const res = await makeRequest(req.caller, req.id);

            return res;
        } catch (e) {
            throw e;
        }
    }

    return { deleteProject, addEnvironmentToProject, removeEnvironmentFromProject, errors };
};

export default useProjectApi;
