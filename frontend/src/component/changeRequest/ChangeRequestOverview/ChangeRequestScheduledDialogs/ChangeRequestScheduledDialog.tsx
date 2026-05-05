import type { FC, ReactElement } from 'react';
import { Alert, styled, Typography } from '@mui/material';
import { Dialogue } from 'component/common/Dialogue/Dialogue';

export interface ChangeRequestScheduledDialogProps {
    title: string;
    primaryButtonText: string;
    open: boolean;
    onConfirm: () => void;
    onClose: () => void;
    scheduledTime?: string;
    message: string;
    permissionButton?: ReactElement;
    disabled?: boolean;
}

const StyledAlert = styled(Alert)(({ theme }) => ({
    marginBottom: theme.spacing(2),
    backgroundColor: `${theme.palette.neutral.light}!important`,
    color: `${theme.palette.text.primary}!important`,
    borderColor: `${theme.palette.neutral.light}!important`,
}));

export const ChangeRequestScheduledDialog: FC<
    ChangeRequestScheduledDialogProps
> = ({
    open,
    onConfirm,
    onClose,
    title,
    primaryButtonText,
    disabled,
    message,
    scheduledTime,
    permissionButton,
}) => {
    if (!scheduledTime) return null;

    return (
        <Dialogue
            title={title}
            primaryButtonText={primaryButtonText}
            disabledPrimaryButton={disabled}
            secondaryButtonText='Cancel'
            open={open}
            onClose={onClose}
            onClick={() => onConfirm()}
            permissionButton={permissionButton}
            fullWidth
        >
            <StyledAlert icon={false}>
                There is a scheduled time to apply these changes set for{' '}
                <strong>
                    <br />
                    {`${new Date(scheduledTime).toLocaleString()}`}
                </strong>
            </StyledAlert>
            <Typography variant={'body1'}>{message}</Typography>
        </Dialogue>
    );
};
