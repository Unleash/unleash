import { useCallback, useState } from 'react';
import useToast from 'hooks/useToast';
import { formatUnknownError } from 'utils/formatUnknownError';
import {
    IFeatureStrategy,
} from '../interfaces/strategy';
import { useChangeRequestApi } from './api/actions/useChangeRequestApi/useChangeRequestApi';
import { useChangeRequestOpen } from './api/getters/useChangeRequestOpen/useChangeRequestOpen';

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
    const { addChangeRequest } = useChangeRequestApi();
    const { refetch } = useChangeRequestOpen(project);

    const [changeRequestDialogDetails, setChangeRequestDialogDetails] =
        useState<{
            strategy?: IFeatureStrategy;
            strategies?: IFeatureStrategy[];
            environment?: string;
            fromEnvironment?: string;
            isOpen: boolean;
        }>({ isOpen: false });

    const onChangeRequestAddStrategy = useCallback(
        (
            environment: string,
            strategy: IFeatureStrategy,
            fromEnvironment?: string
        ) => {
            setChangeRequestDialogDetails({
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
            strategies: IFeatureStrategy[],
            fromEnvironment: string
        ) => {
            setChangeRequestDialogDetails({
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
        const { environment, strategy } = changeRequestDialogDetails;
        if (environment && featureName && strategy) {
            try {
                await addChangeRequest(
                    project,
                    environment,
                    {
                        feature: featureName,
                        action: action,
                        payload: strategy,
                    }
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
        }
        //eslint-disable-next-line
    }, [addChangeRequest]);

    const onChangeRequestAddStrategiesConfirm = useCallback(async () => {
        const { environment, strategies } = changeRequestDialogDetails;
        if (environment && featureName && strategies) {
            try {
                await Promise.all(
                    changeRequestDialogDetails.strategies!.map(strategy => {
                        return addChangeRequest(
                            project,
                            environment,
                            {
                                feature: featureName,
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
        }
        //eslint-disable-next-line
    }, [addChangeRequest]);

    return {
        onChangeRequestAddStrategy,
        onChangeRequestAddStrategies,
        onChangeRequestAddStrategyClose,
        onChangeRequestAddStrategyConfirm,
        onChangeRequestAddStrategiesConfirm,
        changeRequestDialogDetails,
    };
};
