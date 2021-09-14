import {
    IEnvironmentPayload,
    ISortOrderPayload,
    IEnvironmentEditPayload,
} from '../../../../interfaces/environments';
import useAPI from '../useApi/useApi';

const useEnvironmentApi = () => {
    const { makeRequest, createRequest, errors, loading } = useAPI({
        propagateErrors: true,
    });

    const validateEnvName = async (envName: string) => {
        const path = `api/admin/environments/validate`;
        const req = createRequest(
            path,
            { method: 'POST', body: JSON.stringify({ name: envName }) },
            'validateEnvName'
        );

        try {
            const res = await makeRequest(req.caller, req.id, false);

            return res;
        } catch (e) {
            throw e;
        }
    };

    const createEnvironment = async (payload: IEnvironmentPayload) => {
        const path = `api/admin/environments`;
        const req = createRequest(
            path,
            { method: 'POST', body: JSON.stringify(payload) },
            'createEnvironment'
        );

        try {
            const res = await makeRequest(req.caller, req.id);

            return res;
        } catch (e) {
            throw e;
        }
    };

    const deleteEnvironment = async (name: string) => {
        const path = `api/admin/environments/${name}`;
        const req = createRequest(
            path,
            { method: 'DELETE' },
            'deleteEnvironment'
        );

        try {
            const res = await makeRequest(req.caller, req.id);

            return res;
        } catch (e) {
            throw e;
        }
    };

    const updateEnvironment = async (
        name: string,
        payload: IEnvironmentEditPayload
    ) => {
        const path = `api/admin/environments/update/${name}`;
        const req = createRequest(
            path,
            { method: 'PUT', body: JSON.stringify(payload) },
            'updateEnvironment'
        );

        try {
            const res = await makeRequest(req.caller, req.id);

            return res;
        } catch (e) {
            throw e;
        }
    };

    const changeSortOrder = async (payload: ISortOrderPayload) => {
        const path = `api/admin/environments/sort-order`;
        const req = createRequest(
            path,
            { method: 'PUT', body: JSON.stringify(payload) },
            'changeSortOrder'
        );

        try {
            const res = await makeRequest(req.caller, req.id);

            return res;
        } catch (e) {
            throw e;
        }
    };

    const toggleEnvironmentOn = async (name: string) => {
        const path = `api/admin/environments/${name}/on`;
        const req = createRequest(
            path,
            { method: 'POST' },
            'toggleEnvironmentOn'
        );

        try {
            const res = await makeRequest(req.caller, req.id);

            return res;
        } catch (e) {
            throw e;
        }
    };

    const toggleEnvironmentOff = async (name: string) => {
        const path = `api/admin/environments/${name}/off`;
        const req = createRequest(
            path,
            { method: 'POST' },
            'toggleEnvironmentOff'
        );

        try {
            const res = await makeRequest(req.caller, req.id);

            return res;
        } catch (e) {
            throw e;
        }
    };

    return {
        validateEnvName,
        createEnvironment,
        errors,
        loading,
        deleteEnvironment,
        updateEnvironment,
        changeSortOrder,
        toggleEnvironmentOff,
        toggleEnvironmentOn,
    };
};

export default useEnvironmentApi;
