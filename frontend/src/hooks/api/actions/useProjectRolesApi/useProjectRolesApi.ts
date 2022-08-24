import { IPermission } from 'interfaces/project';
import useAPI from '../useApi/useApi';

interface ICreateRolePayload {
    name: string;
    description: string;
    permissions: IPermission[];
}

const useProjectRolesApi = () => {
    const { makeRequest, createRequest, errors, loading } = useAPI({
        propagateErrors: true,
    });

    const createRole = async (payload: ICreateRolePayload) => {
        const path = `api/admin/roles`;
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

    const editRole = async (id: string, payload: ICreateRolePayload) => {
        const path = `api/admin/roles/${id}`;
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

    const validateRole = async (payload: ICreateRolePayload) => {
        const path = `api/admin/roles/validate`;
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

    const deleteRole = async (id: number) => {
        const path = `api/admin/roles/${id}`;
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
        createRole,
        deleteRole,
        editRole,
        validateRole,
        errors,
        loading,
    };
};

export default useProjectRolesApi;
