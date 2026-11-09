import type { FC, ReactElement } from 'react';
import { Alert, styled, Typography } from '@mui/material';
import { Dialogue } from 'component/common/Dialogue/Dialogue';
import type { Tracking } from 'utils/trackingEvents';

export interface ChangeRequestScheduledDialogProps {
    title: string;
    primaryButtonText?: string;
    open: boolean;
    onConfirm?: () => Promise<unknown>;
    onError?: (error: unknown) => void;
    onClose: () => void;
    scheduledTime?: string;
    message: string;
    permissionButton?: ReactElement;
    disabled?: boolean;
    tracking: Tracking;
}

const StyledAlert = styled(Alert)(({ theme }) => ({
    marginBottom: theme.spacing(2),
    backgroundColor: `${theme.palette.neutral.container}!important`,
    color: `${theme.palette.text.primary}!important`,
    borderColor: `${theme.palette.neutral.container}!important`,
}));

export const ChangeRequestScheduledDialog: FC<
    ChangeRequestScheduledDialogProps
> = ({
    open,
    onConfirm,
    onError,
    onClose,
    title,
    primaryButtonText,
    disabled,
    message,
    scheduledTime,
    permissionButton,
    tracking,
}) => {
    if (!scheduledTime) return null;

    const content = (
        <>
            <StyledAlert icon={false}>
                These changes are scheduled to be applied at{' '}
                <strong>
                    <br />
                    {`${new Date(scheduledTime).toLocaleString()}`}
                </strong>
            </StyledAlert>
            <Typography variant={'body1'}>{message}</Typography>
        </>
    );

    if (onConfirm) {
        return (
            <Dialogue
                title={title}
                primaryButtonText={primaryButtonText}
                disabledPrimaryButton={disabled}
                secondaryButtonText='Cancel'
                open={open}
                onClose={onClose}
                onSubmit={onConfirm}
                onError={onError}
                tracking={tracking}
                fullWidth
            >
                {content}
            </Dialogue>
        );
    }

    return (
        <Dialogue
            title={title}
            secondaryButtonText='Cancel'
            open={open}
            onClose={onClose}
            permissionButton={permissionButton}
            tracking={tracking}
            fullWidth
        >
            {content}
        </Dialogue>
    );
};
