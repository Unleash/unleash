import {useCallback, useState} from 'react';
import useToast from 'hooks/useToast';
import {formatUnknownError} from 'utils/formatUnknownError';
import {IFeatureStrategyPayload} from "../interfaces/strategy";
import {useChangeRequestApi} from "./api/actions/useChangeRequestApi/useChangeRequestApi";
import {useChangeRequestDraft} from "./api/getters/useChangeRequestDraft/useChangeRequestDraft";

export type SuggestStrategyAction =
    'addStrategy'
    | 'updateStrategy'
    | 'deleteStrategy';

export const useChangeRequestAddStrategy = (project: string, featureName: string, action: SuggestStrategyAction) => {
    const { setToastData, setToastApiError } = useToast();
    const { addChangeRequest } = useChangeRequestApi();
    const { refetch: refetchSuggestedChange } =
        useChangeRequestDraft(project);

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
        (environment: string, strategy: IFeatureStrategyPayload) => {
            setChangeRequestDialogDetails({
                featureName,
                environment,
                strategy,
                isOpen: true,
            });
        },
        []
    );

    const onChangeRequestAddStrategies = useCallback(
        (environment: string, strategies: IFeatureStrategyPayload[], fromEnvironment: string) => {
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
            await addChangeRequest(
                project,
                changeRequestDialogDetails.environment!,
                {
                    feature: changeRequestDialogDetails.featureName!,
                    action: action,
                    payload: changeRequestDialogDetails.strategy!,
                }
            );
            refetchSuggestedChange();
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

    const onChangeRequestAddStrategiesConfirm = useCallback(async () => {
        try {
            debugger;
            changeRequestDialogDetails.strategies!.map(async (strategy) => {
                    await addChangeRequest(
                        project,
                        changeRequestDialogDetails.environment!,
                        {
                            feature: changeRequestDialogDetails.featureName!,
                            action: action,
                            payload: strategy,
                        }
                    );
            })
            refetchSuggestedChange();
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
        onChangeRequestAddStrategy,
        onChangeRequestAddStrategies,
        onChangeRequestAddStrategyClose,
        onChangeRequestAddStrategyConfirm,
        onChangeRequestAddStrategiesConfirm,
        changeRequestDialogDetails,
    };
};
