import { IAction, IActionSet } from 'interfaces/action';
import useAPI from '../useApi/useApi';

const ENDPOINT = 'api/admin/actions';

export type ActionPayload = Omit<
    IAction,
    'id' | 'createdAt' | 'createdByUserId'
>;

export type ActionSetPayload = Omit<
    IActionSet,
    'id' | 'createdAt' | 'createdByUserId'
> & {
    actions: ActionPayload[];
};

export const useActionsApi = () => {
    const { loading, makeRequest, createRequest, errors } = useAPI({
        propagateErrors: true,
    });

    const addActionSet = async (actionSet: ActionSetPayload) => {
        const requestId = 'addActionSet';
        const req = createRequest(
            ENDPOINT,
            {
                method: 'POST',
                body: JSON.stringify(actionSet),
            },
            requestId,
        );

        const response = await makeRequest(req.caller, req.id);
        return response.json();
    };

    const updateActionSet = async (
        actionSetId: number,
        actionSet: ActionSetPayload,
    ) => {
        const requestId = 'updateActionSet';
        const req = createRequest(
            `${ENDPOINT}/${actionSetId}`,
            {
                method: 'PUT',
                body: JSON.stringify(actionSet),
            },
            requestId,
        );

        await makeRequest(req.caller, req.id);
    };

    const removeActionSet = async (actionSetId: number) => {
        const requestId = 'removeActionSet';
        const req = createRequest(
            `${ENDPOINT}/${actionSetId}`,
            { method: 'DELETE' },
            requestId,
        );

        await makeRequest(req.caller, req.id);
    };

    return {
        addActionSet,
        updateActionSet,
        removeActionSet,
        errors,
        loading,
    };
};
