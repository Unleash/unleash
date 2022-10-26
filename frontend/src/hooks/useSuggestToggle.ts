import { useCallback, useState } from 'react';

export const useSuggestToggle = () => {
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

    return {
        onSuggestToggle,
        onSuggestToggleClose,
        suggestChangesDialogDetails,
    };
};
