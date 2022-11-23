import { useCallback, useState } from 'react';
import useToast from 'hooks/useToast';
import { formatUnknownError } from 'utils/formatUnknownError';
import { useChangeRequestApi } from './api/actions/useChangeRequestApi/useChangeRequestApi';
import { usePendingChangeRequests } from './api/getters/usePendingChangeRequests/usePendingChangeRequests';

export const useChangeRequestToggle = (project: string) => {
    const { setToastData, setToastApiError } = useToast();
    const { addChangeRequest } = useChangeRequestApi();
    const { refetch: refetchChangeRequests } =
        usePendingChangeRequests(project);

    const [changeRequestDialogDetails, setChangeRequestDialogDetails] =
        useState<{
            enabled?: boolean;
            featureName?: string;
            environment?: string;
            isOpen: boolean;
        }>({ isOpen: false });

    const onChangeRequestToggle = useCallback(
        (featureName: string, environment: string, enabled: boolean) => {
            setChangeRequestDialogDetails({
                featureName,
                environment,
                enabled,
                isOpen: true,
            });
        },
        []
    );

    const onChangeRequestToggleClose = useCallback(() => {
        setChangeRequestDialogDetails({ isOpen: false });
    }, []);

    const onChangeRequestToggleConfirm = useCallback(async () => {
        try {
            await addChangeRequest(
                project,
                changeRequestDialogDetails.environment!,
                {
                    feature: changeRequestDialogDetails.featureName!,
                    action: 'updateEnabled',
                    payload: {
                        enabled: Boolean(changeRequestDialogDetails.enabled),
                    },
                }
            );
            refetchChangeRequests();
            setChangeRequestDialogDetails({ isOpen: false });
            setToastData({
                type: 'success',
                title: 'Changes added to the draft!',
            });
        } catch (error) {
            setToastApiError(formatUnknownError(error));
            setChangeRequestDialogDetails({ isOpen: false });
        }
    }, [addChangeRequest]);

    return {
        onChangeRequestToggle,
        onChangeRequestToggleClose,
        onChangeRequestToggleConfirm,
        changeRequestDialogDetails,
    };
};
