import useAPI from '../useApi/useApi.js';
import { useTracking } from 'hooks/useTracking';
import {
    changeAddedTracking,
    changeDiscardedTracking,
    commentAddedTracking,
    draftDiscardedTracking,
    titleUpdatedTracking,
} from 'component/changeRequest/changeRequestTracking';

export interface IChangeSchema {
    feature: string | null;
    action:
        | 'updateEnabled'
        | 'addStrategy'
        | 'updateStrategy'
        | 'updateMilestoneStrategy'
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
        | 'changeReleasePlanSafeguard'
        | 'deleteReleasePlanSafeguard'
        | 'changeFeatureEnvSafeguard'
        | 'deleteFeatureEnvSafeguard'
        | 'resumeMilestoneProgression';
    payload: string | boolean | object | number | undefined;
}

export interface IChangeRequestConfig {
    project: string;
    environment: string;
    enabled: boolean;
    requiredApprovals: number;
}

export const useChangeRequestApi = () => {
    const trackChangeAdded = useTracking(changeAddedTracking);
    const trackChangeDiscarded = useTracking(changeDiscardedTracking);
    const trackDraftDiscarded = useTracking(draftDiscardedTracking);
    const trackCommentAdded = useTracking(commentAddedTracking);
    const trackTitleUpdated = useTracking(titleUpdatedTracking);

    const { makeRequest, createRequest, errors, loading } = useAPI({
        propagateErrors: true,
    });

    const addChange = async (
        project: string,
        environment: string,
        payload: IChangeSchema | IChangeSchema[],
    ) => {
        const changes = Array.isArray(payload) ? payload : [payload];

        const path = `api/admin/projects/${project}/environments/${environment}/change-requests`;
        const req = createRequest(path, {
            method: 'POST',
            body: JSON.stringify(payload),
        });

        return trackChangeAdded.mutation(
            async () => {
                const response = await makeRequest(req.caller, req.id);
                return response.json();
            },
            // A bulk call only ever carries one kind of change.
            { changeType: changes[0].action, changeCount: changes.length },
        );
    };

    const changeState = async (
        project: string,
        changeRequestId: number,
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

        return trackChangeDiscarded.mutation(() =>
            makeRequest(req.caller, req.id),
        );
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

        return trackDraftDiscarded.mutation(() =>
            makeRequest(req.caller, req.id),
        );
    };

    const addComment = async (
        projectId: string,
        changeRequestId: string,
        text: string,
    ) => {
        const path = `/api/admin/projects/${projectId}/change-requests/${changeRequestId}/comments`;
        const req = createRequest(path, {
            method: 'POST',
            body: JSON.stringify({ text }),
        });

        return trackCommentAdded.mutation(() =>
            makeRequest(req.caller, req.id),
        );
    };

    const updateTitle = async (
        project: string,
        changeRequestId: number,
        title: string,
    ) => {
        const path = `api/admin/projects/${project}/change-requests/${changeRequestId}/title`;
        const req = createRequest(path, {
            method: 'PUT',
            body: JSON.stringify({ title }),
        });

        return trackTitleUpdated.mutation(() =>
            makeRequest(req.caller, req.id),
        );
    };
    const updateRequestedApprovers = async (
        project: string,
        changeRequestId: number,
        reviewers: number[],
    ) => {
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
