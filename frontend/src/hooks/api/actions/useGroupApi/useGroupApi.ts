import useAPI from '../useApi/useApi.js';
import type { IGroupUserModel } from 'interfaces/group';

interface ICreateGroupPayload {
    name: string;
    description: string;
    mappingsSSO: string[];
    users: IGroupUserModel[];
}

export const useGroupApi = () => {
    const { makeRequest, createRequest, errors, loading } = useAPI({
        propagateErrors: true,
    });

    const createGroup = async (payload: ICreateGroupPayload) => {
        const path = `api/admin/groups`;
        const req = createRequest(path, {
            method: 'POST',
            body: JSON.stringify(payload),
        });

        const response = await makeRequest(req.caller, req.id);
        return response.json();
    };

    const updateGroup = async (
        groupId: number,
        payload: ICreateGroupPayload,
    ) => {
        const path = `api/admin/groups/${groupId}`;
        const req = createRequest(path, {
            method: 'PUT',
            body: JSON.stringify(payload),
        });

        await makeRequest(req.caller, req.id);
    };

    const removeGroup = async (groupId: number) => {
        const path = `api/admin/groups/${groupId}`;
        const req = createRequest(path, {
            method: 'DELETE',
        });

        await makeRequest(req.caller, req.id);
    };

    const deleteScimGroups = async () => {
        const path = `api/admin/groups/scim-groups`;
        const req = createRequest(path, {
            method: 'DELETE',
        });

        await makeRequest(req.caller, req.id);
    };

    return {
        createGroup,
        updateGroup,
        removeGroup,
        deleteScimGroups,
        errors,
        loading,
    };
};
