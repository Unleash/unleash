import useAPI from '../useApi/useApi';

export interface IChangeRequestsSchema {
    feature: string;
    action:
        | 'updateEnabled'
        | 'addStrategy'
        | 'updateStrategy'
        | 'deleteStrategy';
    payload: string | boolean | object | number;
}

export const useChangeRequestApi = () => {
    const { makeRequest, createRequest, errors, loading } = useAPI({
        propagateErrors: true,
    });

    const addChangeRequest = async (
        project: string,
        environment: string,
        payload: IChangeRequestsSchema
    ) => {
        const path = `api/admin/projects/${project}/environments/${environment}/change-requests`;
        const req = createRequest(path, {
            method: 'POST',
            body: JSON.stringify(payload),
        });
        try {
            const response = await makeRequest(req.caller, req.id);
            return response.json();
        } catch (e) {
            throw e;
        }
    };

    const changeState = async (
        project: string,
        changeRequestId: number,
        payload: any
    ) => {
        const path = `api/admin/projects/${project}/change-requests/${changeRequestId}/state`;
        const req = createRequest(path, {
            method: 'PUT',
            body: JSON.stringify(payload),
        });
        try {
            const response = await makeRequest(req.caller, req.id);
            return response.json();
        } catch (e) {
            throw e;
        }
    };

    const applyChanges = async (project: string, changeRequestId: string) => {
        const path = `api/admin/projects/${project}/change-requests/${changeRequestId}/apply`;
        const req = createRequest(path, {
            method: 'PUT',
        });
        try {
            const response = await makeRequest(req.caller, req.id);
            return response;
        } catch (e) {
            throw e;
        }
    };

    const discardChangeRequestEvent = async (
        project: string,
        changeRequestId: number,
        changeRequestEventId: number
    ) => {
        const path = `api/admin/projects/${project}/change-requests/${changeRequestId}/changes/${changeRequestEventId}`;
        const req = createRequest(path, {
            method: 'DELETE',
        });
        try {
            return await makeRequest(req.caller, req.id);
        } catch (e) {
            throw e;
        }
    };

    return {
        addChangeRequest,
        applyChanges,
        changeState,
        discardChangeRequestEvent,
        errors,
        loading,
    };
};
