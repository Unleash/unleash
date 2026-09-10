import type React from 'react';
import { type KeyboardEvent, useEffect, useState } from 'react';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    styled,
} from '@mui/material';

import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { DIALOGUE_CONFIRM_ID } from 'utils/testIds';
import { useTracking } from 'hooks/useTracking';
import {
    dismissMethodFromCloseReason,
    type Tracking,
} from 'utils/trackingEvents';

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

// onSubmit when the primary button sends the request: the dialog runs it, disables the button
// while pending, and emits the whole journey, so tracking is required.
// onClick when the button only moves the user on, like the production guard: the dialog emits
// opened and dismissed, whatever runs next owns the request.
type DialoguePrimaryAction =
    | {
          onSubmit: () => Promise<unknown>;
          onError?: (error: unknown) => void;
          tracking: Tracking;
          onClick?: never;
      }
    | {
          onClick?: (e: React.SyntheticEvent) => void;
          tracking?: Tracking;
          onSubmit?: never;
          onError?: never;
      };

type IDialogue = DialoguePrimaryAction & {
    primaryButtonText?: string;
    secondaryButtonText?: string;
    open: boolean;
    setOpen?: (status: boolean) => void;
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
};

export const Dialogue: React.FC<IDialogue> = ({
    children,
    open,
    setOpen,
    onClick,
    onSubmit,
    onError,
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
    const trackDialog = useTracking(tracking);
    const [pending, setPending] = useState(false);

    // Opening a dialog is a user action, so it gets its own row.
    useEffect(() => {
        if (open) {
            trackDialog('opened');
        }
    }, [open, trackDialog]);

    const submit = async (request: () => Promise<unknown>) => {
        setPending(true);
        try {
            await trackDialog.mutation(request);
        } catch (error: unknown) {
            onError?.(error);
        } finally {
            setPending(false);
        }
    };

    const primaryAction = onSubmit ? () => submit(onSubmit) : onClick;

    const handleConfirm =
        formId && primaryAction
            ? (e: React.SyntheticEvent) => {
                  e.preventDefault();
                  primaryAction(e);
              }
            : primaryAction;

    // Older callers close via setOpen, which skips MUI's onClose. When both are given MUI
    // also fires for Escape, so only emit here when it will not.
    const onKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape' && setOpen) {
            if (!onClose) {
                trackDialog('dismissed', { method: 'escape' });
            }
            setOpen(false);
        }
    };

    const handleMuiClose = (e: React.SyntheticEvent, reason?: string) => {
        trackDialog('dismissed', {
            method: dismissMethodFromCloseReason(reason),
        });
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
                                condition={Boolean(handleConfirm)}
                                show={
                                    <Button
                                        form={formId}
                                        color='primary'
                                        variant='contained'
                                        onClick={handleConfirm}
                                        autoFocus={!formId}
                                        disabled={
                                            disabledPrimaryButton || pending
                                        }
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
                                    trackDialog('dismissed', {
                                        method: 'cancel-button',
                                    });
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
