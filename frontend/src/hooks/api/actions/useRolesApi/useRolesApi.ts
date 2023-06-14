import { IPermission } from 'interfaces/permissions';
import useAPI from '../useApi/useApi';

interface IRolePayload {
    name: string;
    description: string;
    permissions: IPermission[];
}

export const useRolesApi = () => {
    const { loading, makeRequest, createRequest, errors } = useAPI({
        propagateErrors: true,
    });

    const addRole = async (role: IRolePayload) => {
        const requestId = 'addRole';
        const req = createRequest(
            'api/admin/roles',
            {
                method: 'POST',
                body: JSON.stringify(role),
            },
            requestId
        );

        const response = await makeRequest(req.caller, req.id);
        return await response.json();
    };

    const updateRole = async (roleId: number, role: IRolePayload) => {
        const requestId = 'updateRole';
        const req = createRequest(
            `api/admin/roles/${roleId}`,
            {
                method: 'PUT',
                body: JSON.stringify(role),
            },
            requestId
        );

        await makeRequest(req.caller, req.id);
    };

    const removeRole = async (roleId: number) => {
        const requestId = 'removeRole';
        const req = createRequest(
            `api/admin/roles/${roleId}`,
            { method: 'DELETE' },
            requestId
        );

        await makeRequest(req.caller, req.id);
    };

    const validateRole = async (payload: IRolePayload) => {
        const requestId = 'validateRole';
        const req = createRequest(
            'api/admin/roles/validate',
            {
                method: 'POST',
                body: JSON.stringify(payload),
            },
            requestId
        );

        await makeRequest(req.caller, req.id);
    };

    return {
        addRole,
        updateRole,
        removeRole,
        validateRole,
        errors,
        loading,
    };
};
