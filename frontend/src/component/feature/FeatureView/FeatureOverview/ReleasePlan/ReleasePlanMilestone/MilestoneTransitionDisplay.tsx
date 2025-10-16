import BoltIcon from '@mui/icons-material/Bolt';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { Button, IconButton, styled } from '@mui/material';
import type { MilestoneStatus } from './ReleasePlanMilestoneStatus.tsx';
import { useState } from 'react';
import { useMilestoneProgressionsApi } from 'hooks/api/actions/useMilestoneProgressionsApi/useMilestoneProgressionsApi';
import useToast from 'hooks/useToast';
import { formatUnknownError } from 'utils/formatUnknownError';
import { MilestoneProgressionTimeInput } from '../MilestoneProgressionForm/MilestoneProgressionTimeInput.tsx';
import {
    useMilestoneProgressionForm,
    getTimeValueAndUnitFromMinutes,
} from '../hooks/useMilestoneProgressionForm.js';
import { useChangeRequestsEnabled } from 'hooks/useChangeRequestsEnabled';
import type { UpdateMilestoneProgressionSchema } from 'openapi';

const StyledDisplayContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    justifyContent: 'space-between',
    width: '100%',
}));

const StyledContentGroup = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
}));

const StyledIcon = styled(BoltIcon, {
    shouldForwardProp: (prop) => prop !== 'status',
})<{ status?: MilestoneStatus }>(({ theme, status }) => ({
    color: theme.palette.common.white,
    fontSize: 18,
    flexShrink: 0,
    backgroundColor:
        status === 'completed'
            ? theme.palette.neutral.border
            : theme.palette.primary.main,
    borderRadius: '50%',
    padding: theme.spacing(0.25),
}));

const StyledLabel = styled('span', {
    shouldForwardProp: (prop) => prop !== 'status',
})<{ status?: MilestoneStatus }>(({ theme, status }) => ({
    color:
        status === 'completed'
            ? theme.palette.text.secondary
            : theme.palette.text.primary,
    fontSize: theme.typography.body2.fontSize,
    flexShrink: 0,
}));

const StyledButtonGroup = styled('div')(({ theme }) => ({
    display: 'flex',
    gap: theme.spacing(1),
    alignItems: 'center',
}));

interface IMilestoneTransitionDisplayProps {
    intervalMinutes: number;
    onDelete: () => void;
    milestoneName: string;
    status?: MilestoneStatus;
    projectId: string;
    environment: string;
    featureName: string;
    sourceMilestoneId: string;
    onUpdate: () => void;
    onChangeRequestSubmit?: (
        sourceMilestoneId: string,
        payload: UpdateMilestoneProgressionSchema,
    ) => void;
}

export const MilestoneTransitionDisplay = ({
    intervalMinutes,
    onDelete,
    milestoneName,
    status,
    projectId,
    environment,
    featureName,
    sourceMilestoneId,
    onUpdate,
    onChangeRequestSubmit,
}: IMilestoneTransitionDisplayProps) => {
    const { updateMilestoneProgression } = useMilestoneProgressionsApi();
    const { setToastData, setToastApiError } = useToast();
    const { isChangeRequestConfigured } = useChangeRequestsEnabled(projectId);

    const initial = getTimeValueAndUnitFromMinutes(intervalMinutes);
    const form = useMilestoneProgressionForm(
        sourceMilestoneId,
        sourceMilestoneId, // We don't need targetMilestone for edit, just reuse source
        {
            timeValue: initial.value,
            timeUnit: initial.unit,
        },
    );
    const [isSubmitting, setIsSubmitting] = useState(false);

    const currentIntervalMinutes = form.getIntervalMinutes();
    const hasChanged = currentIntervalMinutes !== intervalMinutes;

    const handleSave = async () => {
        if (isSubmitting || !hasChanged) return;

        const payload: UpdateMilestoneProgressionSchema = {
            transitionCondition: {
                intervalMinutes: currentIntervalMinutes,
            },
        };

        // If change requests are enabled, use the change request flow
        if (isChangeRequestConfigured(environment) && onChangeRequestSubmit) {
            onChangeRequestSubmit(sourceMilestoneId, payload);
            return;
        }

        // Otherwise, directly update via API
        setIsSubmitting(true);
        try {
            await updateMilestoneProgression(
                projectId,
                environment,
                featureName,
                sourceMilestoneId,
                payload,
            );
            setToastData({
                type: 'success',
                text: 'Automation updated successfully',
            });
            onUpdate();
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReset = () => {
        const initial = getTimeValueAndUnitFromMinutes(intervalMinutes);
        form.setTimeValue(initial.value);
        form.setTimeUnit(initial.unit);
    };

    const handleKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter' && hasChanged) {
            event.preventDefault();
            handleSave();
        } else if (event.key === 'Escape' && hasChanged) {
            event.preventDefault();
            handleReset();
        }
    };

    return (
        <StyledDisplayContainer onKeyDown={handleKeyDown}>
            <StyledContentGroup>
                <StyledIcon status={status} />
                <StyledLabel status={status}>
                    Proceed to the next milestone after
                </StyledLabel>
                <MilestoneProgressionTimeInput
                    timeValue={form.timeValue}
                    timeUnit={form.timeUnit}
                    onTimeValueChange={form.handleTimeValueChange}
                    onTimeUnitChange={form.handleTimeUnitChange}
                    disabled={isSubmitting}
                />
            </StyledContentGroup>
            <StyledButtonGroup>
                {hasChanged && (
                    <Button
                        variant='contained'
                        color='primary'
                        onClick={handleSave}
                        size='small'
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Saving...' : 'Save'}
                    </Button>
                )}
                <IconButton
                    onClick={onDelete}
                    size='small'
                    aria-label={`Delete automation for ${milestoneName}`}
                    sx={{ padding: 0.5 }}
                    disabled={isSubmitting}
                >
                    <DeleteOutlineIcon fontSize='small' />
                </IconButton>
            </StyledButtonGroup>
        </StyledDisplayContainer>
    );
};
