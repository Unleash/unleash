import useAPI from '../useApi/useApi';
import { usePlausibleTracker } from '../../../usePlausibleTracker';

export interface IChangeSchema {
    feature: string;
    action:
        | 'updateEnabled'
        | 'addStrategy'
        | 'updateStrategy'
        | 'deleteStrategy'
        | 'patchVariant';
    payload: string | boolean | object | number;
}

export interface IChangeRequestConfig {
    project: string;
    environment: string;
    enabled: boolean;
    requiredApprovals: number;
}

export const useChangeRequestApi = () => {
    const { trackEvent } = usePlausibleTracker();
    const { makeRequest, createRequest, errors, loading } = useAPI({
        propagateErrors: true,
    });

    const addChange = async (
        project: string,
        environment: string,
        payload: IChangeSchema
    ) => {
        trackEvent('change_request', {
            props: {
                eventType: 'change added',
            },
        });

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
        payload: {
            state: 'Approved' | 'Applied' | 'Cancelled' | 'In review';
            comment?: string;
        }
    ) => {
        trackEvent('change_request', {
            props: {
                eventType: payload.state,
            },
        });

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

    const discardChange = async (
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

    const updateChangeRequestEnvironmentConfig = async ({
        project,
        enabled,
        environment,
        requiredApprovals,
    }: IChangeRequestConfig) => {
        const path = `api/admin/projects/${project}/environments/${environment}/change-requests/config`;
        const req = createRequest(path, {
            method: 'PUT',
            body: JSON.stringify({
                changeRequestsEnabled: enabled,
                requiredApprovals,
            }),
        });

        try {
            return await makeRequest(req.caller, req.id);
        } catch (e) {
            throw e;
        }
    };

    const discardDraft = async (projectId: string, draftId: number) => {
        const path = `api/admin/projects/${projectId}/change-requests/${draftId}`;
        const req = createRequest(path, {
            method: 'DELETE',
        });

        try {
            return await makeRequest(req.caller, req.id);
        } catch (e) {
            throw e;
        }
    };

    const addComment = async (
        projectId: string,
        changeRequestId: string,
        text: string
    ) => {
        trackEvent('change_request', {
            props: {
                eventType: 'comment added',
            },
        });

        const path = `/api/admin/projects/${projectId}/change-requests/${changeRequestId}/comments`;
        const req = createRequest(path, {
            method: 'POST',
            body: JSON.stringify({ text }),
        });

        try {
            return await makeRequest(req.caller, req.id);
        } catch (e) {
            throw e;
        }
    };

    return {
        addChange,
        changeState,
        discardChange,
        updateChangeRequestEnvironmentConfig,
        discardDraft,
        addComment,
        errors,
        loading,
    };
};
