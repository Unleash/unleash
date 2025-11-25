import useAPI from '../useApi/useApi.js';
import { usePlausibleTracker } from '../../../usePlausibleTracker.js';
import type { PlausibleChangeRequestState } from 'component/changeRequest/changeRequest.types';
import { getUniqueChangeRequestId } from 'utils/unique-change-request-id';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { useChangeRequestPlausibleContext } from 'component/changeRequest/ChangeRequestContext';

export interface IChangeSchema {
    feature: string | null;
    action:
        | 'updateEnabled'
        | 'addStrategy'
        | 'updateStrategy'
        | 'deleteStrategy'
        | 'patchVariant'
        | 'reorderStrategy'
        | 'archiveFeature'
        | 'updateSegment'
        | 'deleteSegment'
        | 'addDependency'
        | 'deleteDependency'
        | 'addReleasePlan'
        | 'deleteReleasePlan'
        | 'startMilestone'
        | 'changeMilestoneProgression'
        | 'deleteMilestoneProgression'
        | 'changeSafeguard';
    payload: string | boolean | object | number | undefined;
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
    const { uiConfig } = useUiConfig();
    const { willOverwriteStrategyChanges } = useChangeRequestPlausibleContext();

    const addChange = async (
        project: string,
        environment: string,
        payload: IChangeSchema | IChangeSchema[],
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

        const response = await makeRequest(req.caller, req.id);
        return response.json();
    };

    const changeState = async (
        project: string,
        changeRequestId: number,
        previousState: PlausibleChangeRequestState,
        payload: {
            state:
                | 'Approved'
                | 'Applied'
                | 'Scheduled'
                | 'Cancelled'
                | 'In review'
                | 'Rejected';
            comment?: string;
            scheduledAt?: string;
        },
    ) => {
        trackEvent('change_request', {
            props: {
                eventType: payload.state,
                previousState,
                willOverwriteStrategyChanges,
                id: getUniqueChangeRequestId(uiConfig, changeRequestId),
            },
        });

        const path = `api/admin/projects/${project}/change-requests/${changeRequestId}/state`;
        const req = createRequest(path, {
            method: 'PUT',
            body: JSON.stringify(payload),
        });

        const response = await makeRequest(req.caller, req.id);
        return response.json();
    };

    const discardChange = async (
        project: string,
        changeRequestId: number,
        changeId: number,
    ) => {
        const path = `api/admin/projects/${project}/change-requests/${changeRequestId}/changes/${changeId}`;
        const req = createRequest(path, {
            method: 'DELETE',
        });

        return makeRequest(req.caller, req.id);
    };

    const editChange = async (
        project: string,
        changeRequestId: number,
        changeId: number,
        payload: IChangeSchema,
    ) => {
        const path = `api/admin/projects/${project}/change-requests/${changeRequestId}/changes/${changeId}`;
        const req = createRequest(path, {
            method: 'PUT',
            body: JSON.stringify(payload),
        });

        return makeRequest(req.caller, req.id);
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

        return makeRequest(req.caller, req.id);
    };

    const discardDraft = async (projectId: string, draftId: number) => {
        const path = `api/admin/projects/${projectId}/change-requests/${draftId}`;
        const req = createRequest(path, {
            method: 'DELETE',
        });

        return makeRequest(req.caller, req.id);
    };

    const addComment = async (
        projectId: string,
        changeRequestId: string,
        text: string,
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

        return makeRequest(req.caller, req.id);
    };

    const updateTitle = async (
        project: string,
        changeRequestId: number,
        title: string,
    ) => {
        trackEvent('change_request', {
            props: {
                eventType: 'title updated',
            },
        });

        const path = `api/admin/projects/${project}/change-requests/${changeRequestId}/title`;
        const req = createRequest(path, {
            method: 'PUT',
            body: JSON.stringify({ title }),
        });

        return makeRequest(req.caller, req.id);
    };
    const updateRequestedApprovers = async (
        project: string,
        changeRequestId: number,
        reviewers: number[],
    ) => {
        trackEvent('change_request', {
            props: {
                eventType: 'approvers updated',
            },
        });
        const path = `api/admin/projects/${project}/change-requests/${changeRequestId}/approvers`;
        const req = createRequest(path, {
            method: 'PUT',
            body: JSON.stringify({ reviewers }),
        });
        return makeRequest(req.caller, req.id);
    };

    return {
        addChange,
        editChange,
        changeState,
        discardChange,
        updateChangeRequestEnvironmentConfig,
        discardDraft,
        addComment,
        updateTitle,
        updateRequestedApprovers,
        errors,
        loading,
    };
};
