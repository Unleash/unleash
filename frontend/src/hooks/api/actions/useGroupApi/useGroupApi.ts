import useAPI from '../useApi/useApi';
import { IGroupUserModel } from 'interfaces/group';

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
        try {
            const response = await makeRequest(req.caller, req.id);
            return await response.json();
        } catch (e) {
            throw e;
        }
    };

    const updateGroup = async (
        groupId: number,
        payload: ICreateGroupPayload
    ) => {
        const path = `api/admin/groups/${groupId}`;
        const req = createRequest(path, {
            method: 'PUT',
            body: JSON.stringify(payload),
        });
        try {
            await makeRequest(req.caller, req.id);
        } catch (e) {
            throw e;
        }
    };

    const removeGroup = async (groupId: number) => {
        const path = `api/admin/groups/${groupId}`;
        const req = createRequest(path, {
            method: 'DELETE',
        });
        try {
            await makeRequest(req.caller, req.id);
        } catch (e) {
            throw e;
        }
    };

    return {
        createGroup,
        updateGroup,
        removeGroup,
        errors,
        loading,
    };
};
