import type { ActionSetPayload } from 'hooks/api/actions/useActionsApi/useActionsApi';
import type { IActionSet } from 'interfaces/action';
import type { Tracking } from 'utils/trackingEvents';

export const createActionTracking: Tracking = {
    event: 'project-actions',
    type: 'create-action',
};

export const editActionTracking: Tracking = {
    event: 'project-actions',
    type: 'edit-action',
};

export const deleteActionTracking: Tracking = {
    event: 'project-actions',
    type: 'delete-action',
};

export const toggleActionTracking: Tracking = {
    event: 'project-actions',
    type: 'toggle-action',
};

export const viewActionEventsTracking: Tracking = {
    event: 'project-actions',
    type: 'view-action-events',
};

export type ActionModalOpenedFrom =
    | 'name-cell'
    | 'actions-cell'
    | 'kebab-menu'
    | 'events-modal';

export type EventsModalOpenedFrom = 'kebab-menu' | 'action-modal';

export const projectActionSizeProps = (
    actionSet?: IActionSet | ActionSetPayload,
) => ({
    actionsCount: actionSet?.actions.length,
    filtersCount: actionSet
        ? Object.keys(actionSet.match.payload).length
        : undefined,
});

type ProjectActionField = 'name' | 'enabled' | 'source' | 'actions' | 'filters';

// The values themselves are customer config and belong in the admin event log, not here.
export const projectActionChangedFields = (
    submitted: ActionSetPayload,
    initial: IActionSet,
): ProjectActionField[] => {
    const changes: [ProjectActionField, boolean][] = [
        ['name', submitted.name !== initial.name],
        ['enabled', submitted.enabled !== initial.enabled],
        ['source', submitted.match.sourceId !== initial.match.sourceId],
        ['actions', submitted.actions.length !== initial.actions.length],
        [
            'filters',
            Object.keys(submitted.match.payload).length !==
                Object.keys(initial.match.payload).length,
        ],
    ];

    return changes.filter(([, changed]) => changed).map(([field]) => field);
};
