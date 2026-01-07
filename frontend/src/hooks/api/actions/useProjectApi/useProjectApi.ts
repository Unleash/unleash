import type {
    BatchStaleSchema,
    CreateFeatureStrategySchema,
    CreateProjectSchema,
    UpdateProjectSchema,
    UpdateProjectEnterpriseSettingsSchema,
    ProjectCreatedSchema,
} from 'openapi';
import useAPI from '../useApi/useApi.js';

interface IAccessPayload {
    roles: number[];
    groups: number[];
    users: number[];
}

const useProjectApi = () => {
    const { makeRequest, createRequest, errors, loading } = useAPI({
        propagateErrors: true,
    });

    const createProject = async (
        payload: CreateProjectSchema,
    ): Promise<ProjectCreatedSchema> => {
        const path = `api/admin/projects`;
        const req = createRequest(path, {
            method: 'POST',
            body: JSON.stringify(payload),
        });

        const res = await makeRequest(req.caller, req.id);

        return res.json();
    };

    const validateId = async (id: CreateProjectSchema['id']) => {
        const path = `api/admin/projects/validate`;
        const req = createRequest(path, {
            method: 'POST',
            body: JSON.stringify({ id }),
        });
        const res = await makeRequest(req.caller, req.id);

        return res;
    };

    const editProject = async (id: string, payload: UpdateProjectSchema) => {
        const path = `api/admin/projects/${id}`;
        const req = createRequest(path, {
            method: 'PUT',
            body: JSON.stringify(payload),
        });

        const res = await makeRequest(req.caller, req.id);

        return res;
    };

    const editProjectSettings = async (
        id: string,
        payload: UpdateProjectEnterpriseSettingsSchema,
    ) => {
        const path = `api/admin/projects/${id}/settings`;
        const req = createRequest(path, {
            method: 'PUT',
            body: JSON.stringify(payload),
        });

        const res = await makeRequest(req.caller, req.id);

        return res;
    };

    const deleteProject = async (projectId: string) => {
        const path = `api/admin/projects/${projectId}`;
        const req = createRequest(path, { method: 'DELETE' });

        const res = await makeRequest(req.caller, req.id);

        return res;
    };

    const archiveProject = async (projectId: string) => {
        const path = `api/admin/projects/archive/${projectId}`;
        const req = createRequest(path, { method: 'POST' });

        const res = await makeRequest(req.caller, req.id);

        return res;
    };

    const reviveProject = async (projectId: string) => {
        const path = `api/admin/projects/revive/${projectId}`;
        const req = createRequest(path, { method: 'POST' });

        const res = await makeRequest(req.caller, req.id);

        return res;
    };

    const addEnvironmentToProject = async (
        projectId: string,
        environment: string,
    ) => {
        const path = `api/admin/projects/${projectId}/environments`;
        const req = createRequest(path, {
            method: 'POST',
            body: JSON.stringify({ environment }),
        });

        const res = await makeRequest(req.caller, req.id);

        return res;
    };

    const removeEnvironmentFromProject = async (
        projectId: string,
        environment: string,
    ) => {
        const path = `api/admin/projects/${projectId}/environments/${environment}`;
        const req = createRequest(path, { method: 'DELETE' });

        const res = await makeRequest(req.caller, req.id);

        return res;
    };

    const addAccessToProject = async (
        projectId: string,
        payload: IAccessPayload,
    ) => {
        const path = `api/admin/projects/${projectId}/access`;
        const req = createRequest(path, {
            method: 'POST',
            body: JSON.stringify(payload),
        });

        return await makeRequest(req.caller, req.id);
    };

    const removeUserAccess = async (projectId: string, userId: number) => {
        const path = `api/admin/projects/${projectId}/users/${userId}/roles`;
        const req = createRequest(path, { method: 'DELETE' });

        return await makeRequest(req.caller, req.id);
    };

    const removeGroupAccess = async (projectId: string, groupId: number) => {
        const path = `api/admin/projects/${projectId}/groups/${groupId}/roles`;
        const req = createRequest(path, { method: 'DELETE' });

        return await makeRequest(req.caller, req.id);
    };

    const setUserRoles = (
        projectId: string,
        roleIds: number[],
        userId: number,
    ) => {
        const path = `api/admin/projects/${projectId}/users/${userId}/roles`;
        const req = createRequest(path, {
            method: 'PUT',
            body: JSON.stringify({ roles: roleIds }),
        });

        return makeRequest(req.caller, req.id);
    };

    const setGroupRoles = (
        projectId: string,
        roleIds: number[],
        groupId: number,
    ) => {
        const path = `api/admin/projects/${projectId}/groups/${groupId}/roles`;
        const req = createRequest(path, {
            method: 'PUT',
            body: JSON.stringify({ roles: roleIds }),
        });

        return makeRequest(req.caller, req.id);
    };

    const archiveFeatures = async (projectId: string, featureIds: string[]) => {
        const path = `api/admin/projects/${projectId}/archive`;
        const req = createRequest(path, {
            method: 'POST',
            body: JSON.stringify({ features: featureIds }),
        });

        return makeRequest(req.caller, req.id);
    };

    const verifyArchiveFeatures = async (
        projectId: string,
        featureIds: string[],
    ) => {
        const path = `api/admin/projects/${projectId}/archive/validate`;
        const req = createRequest(path, {
            method: 'POST',
            body: JSON.stringify({ features: featureIds }),
        });

        return makeRequest(req.caller, req.id);
    };

    const reviveFeatures = async (projectId: string, featureIds: string[]) => {
        const path = `api/admin/projects/${projectId}/revive`;
        const req = createRequest(path, {
            method: 'POST',
            body: JSON.stringify({ features: featureIds }),
        });

        return makeRequest(req.caller, req.id);
    };

    const deleteFeature = async (featureId: string) => {
        const path = `api/admin/archive/${featureId}`;
        const req = createRequest(path, {
            method: 'DELETE',
        });

        return makeRequest(req.caller, req.id);
    };

    const deleteFeatures = async (projectId: string, featureIds: string[]) => {
        const path = `api/admin/projects/${projectId}/delete`;
        const req = createRequest(path, {
            method: 'POST',
            body: JSON.stringify({ features: featureIds }),
        });

        return makeRequest(req.caller, req.id);
    };

    const staleFeatures = async (
        projectId: string,
        featureIds: string[],
        stale = true,
    ) => {
        const payload: BatchStaleSchema = {
            features: featureIds,
            stale,
        };

        const path = `api/admin/projects/${projectId}/stale`;
        const req = createRequest(path, {
            method: 'POST',
            body: JSON.stringify(payload),
        });

        return makeRequest(req.caller, req.id);
    };

    const updateDefaultStrategy = async (
        projectId: string,
        environment: string,
        strategy: CreateFeatureStrategySchema,
    ) => {
        const path = `api/admin/projects/${projectId}/environments/${environment}/default-strategy`;
        const req = createRequest(path, {
            method: 'POST',
            body: JSON.stringify(strategy),
        });

        return makeRequest(req.caller, req.id);
    };

    return {
        createProject,
        validateId,
        editProject,
        editProjectSettings,
        deleteProject,
        archiveProject,
        reviveProject,
        addEnvironmentToProject,
        removeEnvironmentFromProject,
        addAccessToProject,
        removeUserAccess,
        removeGroupAccess,
        setUserRoles,
        setGroupRoles,
        archiveFeatures,
        verifyArchiveFeatures,
        reviveFeatures,
        staleFeatures,
        deleteFeature,
        deleteFeatures,
        updateDefaultStrategy,
        errors,
        loading,
    };
};

export default useProjectApi;
