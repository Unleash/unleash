import { useCallback, useState } from 'react';
import useToast from 'hooks/useToast';
import { formatUnknownError } from 'utils/formatUnknownError';
import { useSuggestChangeApi } from './api/actions/useSuggestChangeApi/useSuggestChangeApi';

export const useSuggestToggle = (project: string) => {
    const { setToastData, setToastApiError } = useToast();
    const { addSuggestion } = useSuggestChangeApi(project);
    const [suggestChangesDialogDetails, setSuggestChangesDialogDetails] =
        useState<{
            enabled?: boolean;
            featureName?: string;
            environment?: string;
            isOpen: boolean;
        }>({ isOpen: false });

    const onSuggestToggle = useCallback(
        (featureName: string, environment: string, enabled: boolean) => {
            setSuggestChangesDialogDetails({
                featureName,
                environment,
                enabled,
                isOpen: true,
            });
        },
        []
    );

    const onSuggestToggleClose = useCallback(() => {
        setSuggestChangesDialogDetails({ isOpen: false });
    }, []);

    const onSuggestToggleConfirm = useCallback(async () => {
        try {
            await addSuggestion(suggestChangesDialogDetails.environment!, {
                feature: suggestChangesDialogDetails.featureName!,
                action: 'updateEnabled',
                payload: {
                    enabled: Boolean(suggestChangesDialogDetails.enabled),
                },
            });
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
        onSuggestToggle,
        onSuggestToggleClose,
        onSuggestToggleConfirm,
        suggestChangesDialogDetails,
    };
};
