import { useCallback, useState } from 'react';
import useToast from 'hooks/useToast';
import { formatUnknownError } from 'utils/formatUnknownError';
import { useChangeRequestApi } from './api/actions/useChangeRequestApi/useChangeRequestApi.js';
import { usePendingChangeRequests } from './api/getters/usePendingChangeRequests/usePendingChangeRequests.js';

type ChangeRequestToggleCallbacks = {
    onConfirm?: () => void;
    onSuccess?: () => void;
    onFailure?: () => void;
};

export const useChangeRequestToggle = (project: string) => {
    const { setToastData, setToastApiError } = useToast();
    const { addChange } = useChangeRequestApi();
    const { refetch: refetchChangeRequests } =
        usePendingChangeRequests(project);
    const [pending, setPending] = useState(false);

    const [changeRequestDialogDetails, setChangeRequestDialogDetails] =
        useState<
            {
                enabled?: boolean;
                shouldActivateDisabledStrategies?: boolean;
                featureName?: string;
                environment?: string;
                isOpen: boolean;
            } & ChangeRequestToggleCallbacks
        >({ isOpen: false });

    const onChangeRequestToggle = useCallback(
        (
            featureName: string,
            environment: string,
            enabled: boolean,
            shouldActivateDisabledStrategies: boolean,
            callbacks?: ChangeRequestToggleCallbacks,
        ) => {
            setChangeRequestDialogDetails({
                featureName,
                environment,
                enabled,
                shouldActivateDisabledStrategies,
                ...callbacks,
                isOpen: true,
            });
        },
        [],
    );

    const onChangeRequestToggleClose = useCallback(() => {
        setChangeRequestDialogDetails((prev) => ({ ...prev, isOpen: false }));
    }, []);

    const onChangeRequestToggleConfirm = useCallback(async () => {
        changeRequestDialogDetails.onConfirm?.();
        try {
            setPending(true);
            await addChange(project, changeRequestDialogDetails.environment!, {
                feature: changeRequestDialogDetails.featureName!,
                action: 'updateEnabled',
                payload: {
                    enabled: Boolean(changeRequestDialogDetails.enabled),
                    shouldActivateDisabledStrategies: Boolean(
                        changeRequestDialogDetails.shouldActivateDisabledStrategies,
                    ),
                },
            });
            refetchChangeRequests();
            setChangeRequestDialogDetails((prev) => ({
                ...prev,
                isOpen: false,
            }));
            setToastData({
                type: 'success',
                text: 'Changes added to draft',
            });
            changeRequestDialogDetails.onSuccess?.();
        } catch (error) {
            setToastApiError(formatUnknownError(error));
            setChangeRequestDialogDetails((prev) => ({
                ...prev,
                isOpen: false,
            }));
            changeRequestDialogDetails.onFailure?.();
        } finally {
            setPending(false);
        }
    }, [addChange, changeRequestDialogDetails]);

    return {
        pending,
        onChangeRequestToggle,
        onChangeRequestToggleClose,
        onChangeRequestToggleConfirm,
        changeRequestDialogDetails,
    };
};
