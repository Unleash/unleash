import { FC, ReactElement } from 'react';
import { Alert, styled, Typography } from '@mui/material';
import { Dialogue } from '../../../common/Dialogue/Dialogue';

export interface ChangeRequestScheduleDialogueProps {
    title: string;
    primaryButtonText: string;
    open: boolean;
    onConfirm: () => void;
    onClose: () => void;
    scheduledTime?: string;
    message: string;
    permissionButton?: ReactElement;
    disabled?: boolean;
    projectId?: string;
    environment?: string;
}

const StyledAlert = styled(Alert)(({ theme }) => ({
    marginBottom: theme.spacing(2),
    backgroundColor: `${theme.palette.neutral.light}!important`,
    color: `${theme.palette.text.primary}!important`,
    borderColor: `${theme.palette.neutral.light}!important`,
}));

export const ChangeRequestScheduledDialogue: FC<
    ChangeRequestScheduleDialogueProps
> = ({
    open,
    onConfirm,
    onClose,
    title,
    primaryButtonText,
    message,
    scheduledTime,
}) => {
    if (!scheduledTime) return null;

    return (
        <Dialogue
            title={title}
            primaryButtonText={primaryButtonText}
            secondaryButtonText='Cancel'
            open={open}
            onClose={onClose}
            onClick={() => onConfirm()}
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
