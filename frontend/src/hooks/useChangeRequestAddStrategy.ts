import { useCallback, useState } from 'react';
import useToast from 'hooks/useToast';
import { formatUnknownError } from 'utils/formatUnknownError';
import { IFeatureStrategyPayload } from '../interfaces/strategy';
import { useChangeRequestApi } from './api/actions/useChangeRequestApi/useChangeRequestApi';
import { usePendingChangeRequests } from './api/getters/usePendingChangeRequests/usePendingChangeRequests';

export type ChangeRequestStrategyAction =
    | 'addStrategy'
    | 'updateStrategy'
    | 'deleteStrategy';

export const useChangeRequestAddStrategy = (
    project: string,
    featureName: string,
    action: ChangeRequestStrategyAction
) => {
    const { setToastData, setToastApiError } = useToast();
    const { addChange } = useChangeRequestApi();
    const { refetch } = usePendingChangeRequests(project);

    const [changeRequestDialogDetails, setChangeRequestDialogDetails] =
        useState<{
            strategy?: IFeatureStrategyPayload;
            strategies?: IFeatureStrategyPayload[];
            featureName?: string;
            environment?: string;
            fromEnvironment?: string;
            isOpen: boolean;
        }>({ isOpen: false });

    const onChangeRequestAddStrategy = useCallback(
        (
            environment: string,
            strategy: IFeatureStrategyPayload,
            fromEnvironment?: string
        ) => {
            setChangeRequestDialogDetails({
                featureName,
                environment,
                fromEnvironment,
                strategy,
                isOpen: true,
            });
        },
        []
    );

    const onChangeRequestAddStrategies = useCallback(
        (
            environment: string,
            strategies: IFeatureStrategyPayload[],
            fromEnvironment: string
        ) => {
            setChangeRequestDialogDetails({
                featureName,
                environment,
                fromEnvironment,
                strategies,
                isOpen: true,
            });
        },
        []
    );

    const onChangeRequestAddStrategyClose = useCallback(() => {
        setChangeRequestDialogDetails({ isOpen: false });
    }, []);

    const onChangeRequestAddStrategyConfirm = useCallback(async () => {
        try {
            await addChange(project, changeRequestDialogDetails.environment!, {
                feature: changeRequestDialogDetails.featureName!,
                action: action,
                payload: changeRequestDialogDetails.strategy!,
            });
            refetch();
            setChangeRequestDialogDetails({ isOpen: false });
            setToastData({
                type: 'success',
                title: 'Changes added to the draft!',
            });
        } catch (error) {
            setToastApiError(formatUnknownError(error));
            setChangeRequestDialogDetails({ isOpen: false });
        }
    }, [addChange]);

    const onChangeRequestAddStrategiesConfirm = useCallback(async () => {
        try {
            await Promise.all(
                changeRequestDialogDetails.strategies!.map(strategy => {
                    return addChange(
                        project,
                        changeRequestDialogDetails.environment!,
                        {
                            feature: changeRequestDialogDetails.featureName!,
                            action: action,
                            payload: strategy,
                        }
                    );
                })
            );
            refetch();
            setChangeRequestDialogDetails({ isOpen: false });
            setToastData({
                type: 'success',
                title: 'Changes added to the draft!',
            });
        } catch (error) {
            setToastApiError(formatUnknownError(error));
            setChangeRequestDialogDetails({ isOpen: false });
        }
    }, [addChange]);

    return {
        onChangeRequestAddStrategy,
        onChangeRequestAddStrategies,
        onChangeRequestAddStrategyClose,
        onChangeRequestAddStrategyConfirm,
        onChangeRequestAddStrategiesConfirm,
        changeRequestDialogDetails,
    };
};
