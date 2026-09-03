import type React from 'react';
import { type KeyboardEvent, useEffect, useRef } from 'react';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    styled,
} from '@mui/material';

import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import {
    dismissMethodFromCloseReason,
    useDialogTracking,
} from 'hooks/useDialogTracking';
import { DIALOGUE_CONFIRM_ID } from 'utils/testIds';
import { useEventTracker } from 'hooks/useEventTracker';
import { emitTrackingAction, type Tracking } from 'utils/trackingEvents';

const StyledDialog = styled(Dialog)(({ theme, maxWidth }) => ({
    '& .MuiDialog-paper': {
        borderRadius: theme.shape.borderRadiusLarge,
        maxWidth: !maxWidth ? theme.spacing(85) : undefined,
        backgroundColor: 'transparent',
    },
}));

const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
    backgroundColor: theme.palette.background.alternative,
    color: theme.palette.primary.contrastText,
    padding: theme.spacing(3.5, 6),
    fontWeight: theme.fontWeight.medium,
}));

const StyledDialogBody = styled('div')(({ theme }) => ({
    padding: theme.spacing(6),
    backgroundColor: theme.palette.background.paper,
}));

const StyledDialogContent = styled(DialogContent)(({ theme }) => ({
    padding: 0,
    marginBottom: theme.spacing(6),
}));

const StyledDialogActions = styled(DialogActions)(({ theme }) => ({
    gap: theme.spacing(2),
    padding: 0,
}));

interface IDialogue {
    primaryButtonText?: string;
    secondaryButtonText?: string;
    open: boolean;
    setOpen?: (status: boolean) => void;
    onClick?: (e: React.SyntheticEvent) => void;
    onClose?: (e: React.SyntheticEvent, reason?: string) => void;
    style?: object;
    title: string;
    fullWidth?: boolean;
    maxWidth?: 'lg' | 'sm' | 'xs' | 'md' | 'xl';
    disabledPrimaryButton?: boolean;
    formId?: string;
    permissionButton?: React.JSX.Element;
    customButton?: React.JSX.Element;
    children?: React.ReactNode;
    tracking?: Tracking;
}

export const Dialogue: React.FC<IDialogue> = ({
    children,
    open,
    setOpen,
    onClick,
    onClose,
    title,
    primaryButtonText,
    disabledPrimaryButton = false,
    secondaryButtonText,
    maxWidth,
    fullWidth = false,
    formId,
    permissionButton,
    customButton,
    tracking,
}) => {
    const emitDismissed = useDialogTracking(open, tracking);
    const { trackEvent } = useEventTracker();
    const openedTrackingRef = useRef(tracking);
    openedTrackingRef.current = tracking;

    // Opening a Dialogue is a deliberate gesture, so it earns its own row.
    useEffect(() => {
        const declaration = openedTrackingRef.current;
        if (open && declaration) {
            emitTrackingAction(trackEvent, declaration, 'opened');
        }
    }, [open, trackEvent]);

    const handleClick = formId
        ? (e: React.SyntheticEvent) => {
              e.preventDefault();
              if (onClick) {
                  onClick(e);
              }
          }
        : onClick;

    // Legacy escape path for consumers wired via setOpen instead of onClose;
    // it bypasses MUI's onClose, so the dismissal is emitted here too (deduped).
    const onKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape' && setOpen) {
            emitDismissed('escape');
            setOpen(false);
        }
    };

    const handleMuiClose = (e: React.SyntheticEvent, reason?: string) => {
        emitDismissed(dismissMethodFromCloseReason(reason));
        onClose?.(e, reason);
    };

    return (
        <StyledDialog
            open={open}
            onClose={onClose ? handleMuiClose : undefined}
            onKeyDown={onKeyDown}
            role={'dialog'}
            fullWidth={fullWidth}
            aria-labelledby={'simple-modal-title'}
            aria-describedby={'simple-modal-description'}
            maxWidth={maxWidth}
        >
            <StyledDialogTitle>{title}</StyledDialogTitle>
            <StyledDialogBody>
                <ConditionallyRender
                    condition={Boolean(children)}
                    show={<StyledDialogContent>{children}</StyledDialogContent>}
                />
                <StyledDialogActions>
                    <ConditionallyRender
                        condition={Boolean(permissionButton)}
                        show={permissionButton!}
                        elseShow={
                            <ConditionallyRender
                                condition={Boolean(onClick)}
                                show={
                                    <Button
                                        form={formId}
                                        color='primary'
                                        variant='contained'
                                        onClick={handleClick}
                                        autoFocus={!formId}
                                        disabled={disabledPrimaryButton}
                                        data-testid={DIALOGUE_CONFIRM_ID}
                                        type={formId ? 'submit' : 'button'}
                                    >
                                        {primaryButtonText || "Yes, I'm sure"}
                                    </Button>
                                }
                            />
                        }
                    />

                    <ConditionallyRender
                        condition={Boolean(onClose)}
                        show={
                            <Button
                                onClick={(e) => {
                                    emitDismissed('cancel-button');
                                    onClose?.(e);
                                }}
                            >
                                {secondaryButtonText || 'No, take me back'}
                            </Button>
                        }
                    />

                    <ConditionallyRender
                        condition={Boolean(customButton)}
                        show={customButton}
                    />
                </StyledDialogActions>
            </StyledDialogBody>
        </StyledDialog>
    );
};
