import { type FC, useState } from 'react';
import { Alert, Box, styled, Typography } from '@mui/material';
import { Dialogue } from 'component/common/Dialogue/Dialogue';
import { APPLY_CHANGE_REQUEST } from 'component/providers/AccessProvider/permissions';
import PermissionButton from 'component/common/PermissionButton/PermissionButton';
import { DateTimePicker } from 'component/common/DateTimePicker/DateTimePicker';
import { getBrowserTimezone } from '../ChangeRequestReviewStatus/utils.ts';

export interface ScheduleChangeRequestDialogProps {
    title: string;
    primaryButtonText: string;
    open: boolean;
    onConfirm: (selectedDate: Date) => void;
    onClose: () => void;
    projectId: string;
    environment: string;
    disabled?: boolean;
    scheduledAt?: string;
}

const StyledContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing(2),
}));

export const ScheduleChangeRequestDialog: FC<
    ScheduleChangeRequestDialogProps
> = ({
    open,
    onConfirm,
    onClose,
    title,
    primaryButtonText,
    projectId,
    environment,
    disabled,
    scheduledAt,
}) => {
    const [selectedDate, setSelectedDate] = useState(
        scheduledAt ? new Date(scheduledAt) : new Date(),
    );
    const [error, setError] = useState<string | undefined>(undefined);

    const timezone = getBrowserTimezone();

    return (
        <Dialogue
            title={title}
            primaryButtonText={primaryButtonText}
            disabledPrimaryButton={disabled}
            secondaryButtonText='Cancel'
            open={open}
            onClose={() => onClose()}
            onClick={() => onConfirm(selectedDate)}
            permissionButton={
                <PermissionButton
                    variant='contained'
                    onClick={() => onConfirm(selectedDate)}
                    projectId={projectId}
                    permission={APPLY_CHANGE_REQUEST}
                    environmentId={environment}
                    disabled={disabled}
                >
                    {primaryButtonText}
                </PermissionButton>
            }
            fullWidth
        >
            <Alert severity={'info'} sx={{ mb: (theme) => theme.spacing(2) }}>
                The time shown below is based on your browser's time zone.
            </Alert>
            <Typography
                variant={'body1'}
                sx={{ mb: (theme) => theme.spacing(4) }}
            >
                Select the date and time when these changes should be applied.
                If you change your mind later, you can reschedule the changes or
                apply them immediately.
            </Typography>
            <StyledContainer>
                <DateTimePicker
                    label='Date'
                    value={selectedDate}
                    onChange={(date) => {
                        setError(undefined);
                        if (date < new Date()) {
                            setError(
                                `The time you provided (${date.toLocaleString()}) is not valid because it's in the past. Please select a time in the future.`,
                            );
                        }
                        setSelectedDate(date);
                    }}
                    min={new Date()}
                    error={Boolean(error)}
                    errorText={error}
                    required
                />
                <Typography variant={'body2'}>
                    Your browser's time zone is {timezone}
                </Typography>
            </StyledContainer>
        </Dialogue>
    );
};
