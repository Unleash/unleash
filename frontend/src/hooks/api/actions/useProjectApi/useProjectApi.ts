import useAPI from '../useApi/useApi';

interface ICreatePayload {
    id: string;
    name: string;
    description: string;
}

const useProjectApi = () => {
    const { makeRequest, createRequest, errors, loading } = useAPI({
        propagateErrors: true,
    });

    const createProject = async (payload: ICreatePayload) => {
        const path = `api/admin/projects`;
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

    const validateId = async (payload: ICreatePayload) => {
        const path = `api/admin/projects/validate`;
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

    const editProject = async (id: string, payload: ICreatePayload) => {
        const path = `api/admin/projects/${id}`;
        const req = createRequest(path, {
            method: 'PUT',
            body: JSON.stringify(payload),
        });

        try {
            const res = await makeRequest(req.caller, req.id);

            return res;
        } catch (e) {
            throw e;
        }
    };

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

    const addEnvironmentToProject = async (
        projectId: string,
        environment: string
    ) => {
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
    };

    const removeEnvironmentFromProject = async (
        projectId: string,
        environment: string
    ) => {
        const path = `api/admin/projects/${projectId}/environments/${environment}`;
        const req = createRequest(path, { method: 'DELETE' });

        try {
            const res = await makeRequest(req.caller, req.id);

            return res;
        } catch (e) {
            throw e;
        }
    };

    return {
        createProject,
        validateId,
        editProject,
        deleteProject,
        addEnvironmentToProject,
        removeEnvironmentFromProject,
        errors,
        loading,
    };
};

export default useProjectApi;
