import useAPI from '../useApi/useApi';

interface ICreatePayload {
    id: string;
    name: string;
    description: string;
}

interface IAccessesPayload {
    users: { id: number }[];
    groups: { id: number }[];
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

    const addAccessToProject = async (
        projectId: string,
        roleId: number,
        accesses: IAccessesPayload
    ) => {
        const path = `api/admin/projects/${projectId}/role/${roleId}/access`;
        const req = createRequest(path, {
            method: 'POST',
            body: JSON.stringify(accesses),
        });

        try {
            const res = await makeRequest(req.caller, req.id);

            return res;
        } catch (e) {
            throw e;
        }
    };

    const removeUserFromRole = async (
        projectId: string,
        roleId: number,
        userId: number
    ) => {
        const path = `api/admin/projects/${projectId}/users/${userId}/roles/${roleId}`;
        const req = createRequest(path, { method: 'DELETE' });

        try {
            const res = await makeRequest(req.caller, req.id);

            return res;
        } catch (e) {
            throw e;
        }
    };

    const removeGroupFromRole = async (
        projectId: string,
        roleId: number,
        groupId: number
    ) => {
        const path = `api/admin/projects/${projectId}/groups/${groupId}/roles/${roleId}`;
        const req = createRequest(path, { method: 'DELETE' });

        try {
            const res = await makeRequest(req.caller, req.id);

            return res;
        } catch (e) {
            throw e;
        }
    };

    const searchProjectUser = async (query: string): Promise<Response> => {
        const path = `api/admin/user-admin/search?q=${query}`;

        const req = createRequest(path, { method: 'GET' });

        try {
            const res = await makeRequest(req.caller, req.id);

            return res;
        } catch (e) {
            throw e;
        }
    };

    const changeUserRole = (
        projectId: string,
        roleId: number,
        userId: number
    ) => {
        const path = `api/admin/projects/${projectId}/users/${userId}/roles/${roleId}`;
        const req = createRequest(path, { method: 'PUT' });

        return makeRequest(req.caller, req.id);
    };

    const changeGroupRole = (
        projectId: string,
        roleId: number,
        groupId: number
    ) => {
        const path = `api/admin/projects/${projectId}/groups/${groupId}/roles/${roleId}`;
        const req = createRequest(path, { method: 'PUT' });

        return makeRequest(req.caller, req.id);
    };

    return {
        createProject,
        validateId,
        editProject,
        deleteProject,
        addEnvironmentToProject,
        removeEnvironmentFromProject,
        addAccessToProject,
        removeUserFromRole,
        removeGroupFromRole,
        changeUserRole,
        changeGroupRole,
        errors,
        loading,
        searchProjectUser,
    };
};

export default useProjectApi;
