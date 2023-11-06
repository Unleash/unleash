import { FC, useState } from 'react';
import { Alert, Box, styled, Typography } from '@mui/material';
import { Dialogue } from 'component/common/Dialogue/Dialogue';
import { APPLY_CHANGE_REQUEST } from 'component/providers/AccessProvider/permissions';
import PermissionButton from 'component/common/PermissionButton/PermissionButton';
import { DateTimePicker } from 'component/common/DateTimePicker/DateTimePicker';
import { getBrowserTimezoneInHumanReadableUTCOffset } from '../ChangeRequestReviewStatus/utils';

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

export const ScheduleChangeRequestDialog: FC<ScheduleChangeRequestDialogProps> =
    ({
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

        const timezone = getBrowserTimezoneInHumanReadableUTCOffset();

        return (
            <Dialogue
                title={title}
                primaryButtonText={primaryButtonText}
                secondaryButtonText='Cancel'
                open={open}
                onClose={onClose}
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
                <Alert
                    severity={'info'}
                    sx={{ mb: (theme) => theme.spacing(2) }}
                >
                    Time zone is not supported. Message about that the time is
                    based on the viewer browser.
                </Alert>
                <Typography
                    variant={'body1'}
                    sx={{ mb: (theme) => theme.spacing(4) }}
                >
                    Select the date and time when these changes to be applied.
                    You will be able to modify the selected time or even to
                    apply directly the changes if needed.
                </Typography>
                <StyledContainer>
                    <DateTimePicker
                        label='Date'
                        value={selectedDate}
                        onChange={(date) => {
                            setError(undefined);
                            if (date < new Date()) {
                                setError('Invalid date, must be in the future');
                            }
                            setSelectedDate(date);
                        }}
                        min={new Date()}
                        error={Boolean(error)}
                        errorText={error}
                        required
                    />
                    <Typography variant={'body2'}>
                        Your timezone is {timezone}
                    </Typography>
                </StyledContainer>
            </Dialogue>
        );
    };
