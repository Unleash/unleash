import BoltIcon from '@mui/icons-material/Bolt';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { Button, IconButton, styled } from '@mui/material';
import type { MilestoneStatus } from './ReleasePlanMilestoneStatus.tsx';
import { MilestoneProgressionTimeInput } from '../MilestoneProgressionForm/MilestoneProgressionTimeInput.tsx';
import {
    useMilestoneProgressionForm,
    getTimeValueAndUnitFromMinutes,
} from '../hooks/useMilestoneProgressionForm.js';
import type { UpdateMilestoneProgressionSchema } from 'openapi';
import type { ReactNode } from 'react';
import { useEffect } from 'react';

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
    onSave: (
        payload: UpdateMilestoneProgressionSchema,
    ) => Promise<{ shouldReset?: boolean }>;
    onDelete: () => void;
    milestoneName: string;
    status?: MilestoneStatus;
    badge?: ReactNode;
}

export const MilestoneTransitionDisplay = ({
    intervalMinutes,
    onSave,
    onDelete,
    milestoneName,
    status,
    badge,
}: IMilestoneTransitionDisplayProps) => {
    const initial = getTimeValueAndUnitFromMinutes(intervalMinutes);
    const form = useMilestoneProgressionForm(
        '', // sourceMilestoneId not needed for display
        '', // targetMilestoneId not needed for display
        {
            timeValue: initial.value,
            timeUnit: initial.unit,
        },
    );

    const currentIntervalMinutes = form.getIntervalMinutes();
    const hasChanged = currentIntervalMinutes !== intervalMinutes;

    useEffect(() => {
        const newInitial = getTimeValueAndUnitFromMinutes(intervalMinutes);
        form.setTimeValue(newInitial.value);
        form.setTimeUnit(newInitial.unit);
    }, [intervalMinutes]);

    const handleSave = async () => {
        if (!hasChanged) return;

        const payload: UpdateMilestoneProgressionSchema = {
            transitionCondition: {
                intervalMinutes: currentIntervalMinutes,
            },
        };

        const result = await onSave(payload);

        if (result?.shouldReset) {
            handleReset();
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
                />
            </StyledContentGroup>
            <StyledButtonGroup>
                {hasChanged && (
                    <Button
                        variant='contained'
                        color='primary'
                        onClick={handleSave}
                        size='small'
                    >
                        Save
                    </Button>
                )}
                {badge}
                <IconButton
                    onClick={onDelete}
                    size='small'
                    aria-label={`Delete automation for ${milestoneName}`}
                    sx={{ padding: 0.5 }}
                >
                    <DeleteOutlineIcon fontSize='small' />
                </IconButton>
            </StyledButtonGroup>
        </StyledDisplayContainer>
    );
};
