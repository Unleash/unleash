import type { BatchStaleSchema, CreateFeatureStrategySchema } from 'openapi';
import useAPI from '../useApi/useApi';
import { ProjectMode } from 'component/project/Project/hooks/useProjectForm';

interface ICreatePayload {
    id: string;
    name: string;
    description: string;
    mode: ProjectMode;
    defaultStickiness: string;
}

interface IAccessPayload {
    roles: number[];
    groups: number[];
    users: number[];
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

        return makeRequest(req.caller, req.id);
    };

    const validateId = async (id: ICreatePayload['id']) => {
        const path = `api/admin/projects/validate`;
        const req = createRequest(path, {
            method: 'POST',
            body: JSON.stringify({ id }),
        });

        return makeRequest(req.caller, req.id);
    };

    const editProject = async (id: string, payload: ICreatePayload) => {
        const path = `api/admin/projects/${id}`;
        const req = createRequest(path, {
            method: 'PUT',
            body: JSON.stringify(payload),
        });

        return makeRequest(req.caller, req.id);
    };

    const deleteProject = async (projectId: string) => {
        const path = `api/admin/projects/${projectId}`;
        const req = createRequest(path, { method: 'DELETE' });

        return makeRequest(req.caller, req.id);
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

        return makeRequest(req.caller, req.id);
    };

    const removeEnvironmentFromProject = async (
        projectId: string,
        environment: string,
    ) => {
        const path = `api/admin/projects/${projectId}/environments/${environment}`;
        const req = createRequest(path, { method: 'DELETE' });

        return makeRequest(req.caller, req.id);
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

        return makeRequest(req.caller, req.id);
    };

    const removeUserAccess = async (projectId: string, userId: number) => {
        const path = `api/admin/projects/${projectId}/users/${userId}/roles`;
        const req = createRequest(path, { method: 'DELETE' });

        return makeRequest(req.caller, req.id);
    };

    const removeGroupAccess = async (projectId: string, groupId: number) => {
        const path = `api/admin/projects/${projectId}/groups/${groupId}/roles`;
        const req = createRequest(path, { method: 'DELETE' });

        return makeRequest(req.caller, req.id);
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
        deleteProject,
        addEnvironmentToProject,
        removeEnvironmentFromProject,
        addAccessToProject,
        removeUserAccess,
        removeGroupAccess,
        setUserRoles,
        setGroupRoles,
        archiveFeatures,
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
