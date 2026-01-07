import type {
    IEnvironmentPayload,
    ISortOrderPayload,
    IEnvironmentEditPayload,
    IEnvironment,
    IEnvironmentClonePayload,
} from 'interfaces/environments';
import useAPI from '../useApi/useApi.js';

const useEnvironmentApi = () => {
    const { makeRequest, createRequest, errors, loading } = useAPI({
        propagateErrors: true,
    });

    const validateEnvName = async (envName: string) => {
        const path = `api/admin/environments/validate`;
        const req = createRequest(
            path,
            { method: 'POST', body: JSON.stringify({ name: envName }) },
            'validateEnvName',
        );

        return makeRequest(req.caller, req.id, false);
    };

    const createEnvironment = async (payload: IEnvironmentPayload) => {
        const path = `api/admin/environments`;
        const req = createRequest(
            path,
            { method: 'POST', body: JSON.stringify(payload) },
            'createEnvironment',
        );

        return makeRequest(req.caller, req.id);
    };

    const deleteEnvironment = async (name: string) => {
        const path = `api/admin/environments/${name}`;
        const req = createRequest(
            path,
            { method: 'DELETE' },
            'deleteEnvironment',
        );

        return makeRequest(req.caller, req.id);
    };

    const updateEnvironment = async (
        name: string,
        payload: IEnvironmentEditPayload,
    ) => {
        const path = `api/admin/environments/update/${name}`;
        const req = createRequest(
            path,
            { method: 'PUT', body: JSON.stringify(payload) },
            'updateEnvironment',
        );

        return makeRequest(req.caller, req.id);
    };

    const cloneEnvironment = async (
        name: string,
        payload: IEnvironmentClonePayload,
    ) => {
        const path = `api/admin/environments/${name}/clone`;
        const req = createRequest(
            path,
            { method: 'POST', body: JSON.stringify(payload) },
            'cloneEnvironment',
        );

        return makeRequest(req.caller, req.id);
    };

    const changeSortOrder = async (payload: ISortOrderPayload) => {
        const path = `api/admin/environments/sort-order`;
        const req = createRequest(
            path,
            { method: 'PUT', body: JSON.stringify(payload) },
            'changeSortOrder',
        );

        return makeRequest(req.caller, req.id);
    };

    const toggleEnvironmentOn = async (name: string) => {
        const path = `api/admin/environments/${name}/on`;
        const req = createRequest(
            path,
            { method: 'POST' },
            'toggleEnvironmentOn',
        );

        return makeRequest(req.caller, req.id);
    };

    const toggleEnvironmentOff = async (name: string) => {
        const path = `api/admin/environments/${name}/off`;
        const req = createRequest(
            path,
            { method: 'POST' },
            'toggleEnvironmentOff',
        );

        return makeRequest(req.caller, req.id);
    };

    return {
        validateEnvName,
        createEnvironment,
        errors,
        loading,
        deleteEnvironment,
        updateEnvironment,
        cloneEnvironment,
        changeSortOrder,
        toggleEnvironmentOff,
        toggleEnvironmentOn,
    };
};

export const createSortOrderPayload = (
    environments: Readonly<IEnvironment[]>,
): ISortOrderPayload => {
    return environments.reduce((payload, env, index) => {
        payload[env.name] = index + 1;
        return payload;
    }, {} as ISortOrderPayload);
};

export default useEnvironmentApi;
