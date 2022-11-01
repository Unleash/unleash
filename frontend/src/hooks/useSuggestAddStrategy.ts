import { useCallback, useState } from 'react';
import useToast from 'hooks/useToast';
import { formatUnknownError } from 'utils/formatUnknownError';
import { useSuggestChangeApi } from './api/actions/useSuggestChangeApi/useSuggestChangeApi';
import { useSuggestedChangesDraft } from './api/getters/useSuggestedChangesDraft/useSuggestedChangesDraft';
import {IStrategyConfig, SuggestChangeAction} from "../../../src/lib/types/model";
import {PartialSome} from "../../../src/lib/types/partial";
import {IFeatureStrategyPayload} from "../interfaces/strategy";

export type SuggestStrategyAction =
    'addStrategy'
    | 'updateStrategy'
    | 'deleteStrategy';

export const useSuggestAddStrategy = (project: string, featureName: string, action: SuggestStrategyAction) => {
    const { setToastData, setToastApiError } = useToast();
    const { addSuggestion } = useSuggestChangeApi();
    const { refetch: refetchSuggestedChange } =
        useSuggestedChangesDraft(project);

    const [suggestChangesDialogDetails, setSuggestChangesDialogDetails] =
        useState<{
            strategy?: IFeatureStrategyPayload;
            strategies?: IFeatureStrategyPayload[];
            featureName?: string;
            environment?: string;
            fromEnvironment?: string;
            isOpen: boolean;
        }>({ isOpen: false });

    const onSuggestAddStrategy = useCallback(
        (environment: string, strategy: IFeatureStrategyPayload) => {
            setSuggestChangesDialogDetails({
                featureName,
                environment,
                strategy,
                isOpen: true,
            });
        },
        []
    );

    const onSuggestAddStrategies = useCallback(
        (environment: string, strategies: IFeatureStrategyPayload[], fromEnvironment: string) => {
            setSuggestChangesDialogDetails({
                featureName,
                environment,
                fromEnvironment,
                strategies,
                isOpen: true,
            });
        },
        []
    );

    const onSuggestAddStrategyClose = useCallback(() => {
        setSuggestChangesDialogDetails({ isOpen: false });
    }, []);

    const onSuggestAddStrategyConfirm = useCallback(async () => {
        try {
            await addSuggestion(
                project,
                suggestChangesDialogDetails.environment!,
                {
                    feature: suggestChangesDialogDetails.featureName!,
                    action: action,
                    payload: suggestChangesDialogDetails.strategy!,
                }
            );
            refetchSuggestedChange();
            setSuggestChangesDialogDetails({ isOpen: false });
            setToastData({
                type: 'success',
                title: 'Changes added to the draft!',
            });
        } catch (error) {
            setToastApiError(formatUnknownError(error));
            setSuggestChangesDialogDetails({ isOpen: false });
        }
    }, [addSuggestion]);

    const onSuggestAddStrategiesConfirm = useCallback(async () => {
        try {
            suggestChangesDialogDetails.strategies!.map(async (strategy) => {
                    await addSuggestion(
                        project,
                        suggestChangesDialogDetails.environment!,
                        {
                            feature: suggestChangesDialogDetails.featureName!,
                            action: action,
                            payload: strategy,
                        }
                    );
            })
            refetchSuggestedChange();
            setSuggestChangesDialogDetails({ isOpen: false });
            setToastData({
                type: 'success',
                title: 'Changes added to the draft!',
            });
        } catch (error) {
            setToastApiError(formatUnknownError(error));
            setSuggestChangesDialogDetails({ isOpen: false });
        }
    }, [addSuggestion]);

    return {
        onSuggestAddStrategy,
        onSuggestAddStrategies,
        onSuggestAddStrategyClose,
        onSuggestAddStrategyConfirm,
        onSuggestAddStrategiesConfirm,
        suggestChangesDialogDetails,
    };
};
