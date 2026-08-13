import { useCallback, useEffect, useRef } from 'react';
import { useEventTracker } from 'hooks/useEventTracker';
import type {
    DialogDismissMethod,
    DialogTrackingId,
} from 'utils/trackingEvents';

export const useTrackDialogDismissed = () => {
    const { trackEvent } = useEventTracker();

    return useCallback(
        (dialog: DialogTrackingId | undefined, method: DialogDismissMethod) => {
            if (!dialog && import.meta.env.DEV) {
                console.warn(
                    'dialog-dismissed emitted without a trackingId; add one to the dialog component',
                );
            }
            trackEvent('dialog-dismissed', {
                props: {
                    action: 'dismissed',
                    dialog: dialog ?? 'untagged',
                    method,
                },
            });
        },
        [trackEvent],
    );
};

export const dismissMethodFromCloseReason = (
    reason: string | undefined,
): DialogDismissMethod => (reason === 'backdropClick' ? 'backdrop' : 'escape');

// One dismissal can fire two close paths: a manual Escape handler and MUI's onClose.
export const useDialogDismissTracking = (
    open: boolean,
    dialog: DialogTrackingId | undefined,
) => {
    const trackDialogDismissed = useTrackDialogDismissed();
    const emittedRef = useRef(false);

    useEffect(() => {
        if (open) {
            emittedRef.current = false;
        }
    }, [open]);

    return useCallback(
        (method: DialogDismissMethod) => {
            if (emittedRef.current) {
                return;
            }
            emittedRef.current = true;
            trackDialogDismissed(dialog, method);
        },
        [trackDialogDismissed, dialog],
    );
};
