import { useCallback, useState } from 'react';
import useToast from 'hooks/useToast';
import { useChangeRequestApi } from './api/actions/useChangeRequestApi/useChangeRequestApi.js';
import { usePendingChangeRequests } from './api/getters/usePendingChangeRequests/usePendingChangeRequests.js';

export const useChangeRequestToggle = (project: string) => {
    const { setToastData } = useToast();
    const { addChange } = useChangeRequestApi();
    const { refetch: refetchChangeRequests } =
        usePendingChangeRequests(project);

    const [changeRequestDialogDetails, setChangeRequestDialogDetails] =
        useState<{
            enabled?: boolean;
            shouldActivateDisabledStrategies?: boolean;
            featureName?: string;
            environment?: string;
            isOpen: boolean;
        }>({ isOpen: false });

    const onChangeRequestToggle = useCallback(
        (
            featureName: string,
            environment: string,
            enabled: boolean,
            shouldActivateDisabledStrategies: boolean,
        ) => {
            setChangeRequestDialogDetails({
                featureName,
                environment,
                enabled,
                shouldActivateDisabledStrategies,
                isOpen: true,
            });
        },
        [],
    );

    const onChangeRequestToggleClose = useCallback(() => {
        setChangeRequestDialogDetails((prev) => ({ ...prev, isOpen: false }));
    }, []);

    // Rejections propagate to the dialog, which reports them and keeps itself open.
    const onChangeRequestToggleConfirm = useCallback(async () => {
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
    }, [addChange, changeRequestDialogDetails]);

    return {
        onChangeRequestToggle,
        onChangeRequestToggleClose,
        onChangeRequestToggleConfirm,
        changeRequestDialogDetails,
    };
};
