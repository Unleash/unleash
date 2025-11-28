import BoltIcon from '@mui/icons-material/Bolt';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { Button, styled } from '@mui/material';
import type { MilestoneStatus } from './ReleasePlanMilestoneStatus.tsx';
import { MilestoneProgressionTimeInput } from '../MilestoneProgressionForm/MilestoneProgressionTimeInput.tsx';
import {
    useMilestoneProgressionForm,
    getTimeValueAndUnitFromMinutes,
} from '../hooks/useMilestoneProgressionForm.js';
import type { ChangeMilestoneProgressionSchema } from 'openapi';
import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { useMilestoneProgressionInfo } from '../hooks/useMilestoneProgressionInfo.ts';
import { UPDATE_FEATURE_STRATEGY } from 'component/providers/AccessProvider/permissions.ts';
import PermissionButton from 'component/common/PermissionButton/PermissionButton.tsx';
import PermissionIconButton from 'component/common/PermissionIconButton/PermissionIconButton.tsx';

const StyledFormWrapper = styled('div', {
    shouldForwardProp: (prop) => prop !== 'hasChanged',
})<{ hasChanged: boolean }>(({ theme, hasChanged }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1.5),
    width: '100%',
    transition: theme.transitions.create(
        ['background-color', 'padding', 'border-radius'],
        {
            duration: theme.transitions.duration.short,
        },
    ),
    ...(hasChanged && {
        backgroundColor: theme.palette.background.elevation1,
        border: `1px solid ${theme.palette.divider}`,
        padding: theme.spacing(1.5, 2),
        borderRadius: `${theme.shape.borderRadiusLarge}px`,
    }),
}));

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
        status?.type === 'completed'
            ? theme.palette.neutral.border
            : theme.palette.primary.main,
    borderRadius: '50%',
    padding: theme.spacing(0.25),
}));

const StyledLabel = styled('span', {
    shouldForwardProp: (prop) => prop !== 'status',
})<{ status?: MilestoneStatus }>(({ theme, status }) => ({
    color:
        status?.type === 'completed'
            ? theme.palette.text.secondary
            : theme.palette.text.primary,
    fontSize: theme.typography.body2.fontSize,
    flexShrink: 0,
}));

const StyledButtonGroup = styled('div', {
    shouldForwardProp: (prop) => prop !== 'hasChanged',
})<{ hasChanged: boolean }>(({ theme, hasChanged }) => ({
    display: 'flex',
    gap: theme.spacing(1),
    alignItems: 'center',
    justifyContent: 'flex-end',
    transition: theme.transitions.create(
        ['border-top', 'padding-top', 'margin-top'],
        {
            duration: theme.transitions.duration.short,
        },
    ),
    ...(hasChanged && {
        paddingTop: theme.spacing(1),
        marginTop: theme.spacing(0.5),
        borderTop: `1px solid ${theme.palette.divider}`,
    }),
}));

const StyledErrorMessage = styled('span')(({ theme }) => ({
    color: theme.palette.error.main,
    fontSize: theme.typography.body2.fontSize,
    paddingLeft: theme.spacing(3.25),
}));

const StyledInfoLine = styled('span')(({ theme }) => ({
    color: theme.palette.text.secondary,
    fontSize: theme.typography.caption.fontSize,
    paddingLeft: theme.spacing(3.25),
    fontStyle: 'italic',
}));

interface IMilestoneTransitionDisplayProps {
    intervalMinutes: number;
    targetMilestoneId: string;
    sourceMilestoneStartedAt?: string | null;
    onSave: (
        payload: ChangeMilestoneProgressionSchema,
    ) => Promise<{ shouldReset?: boolean }>;
    onDelete: () => void;
    milestoneName: string;
    status?: MilestoneStatus;
    badge?: ReactNode;
}

export const ReadonlyMilestoneTransitionDisplay = ({
    intervalMinutes,
    status,
}: {
    intervalMinutes: number;
    status?: MilestoneStatus;
}) => {
    const initial = getTimeValueAndUnitFromMinutes(intervalMinutes);

    return (
        <StyledDisplayContainer>
            <StyledContentGroup>
                <StyledIcon status={status} />
                <StyledLabel status={status}>
                    Proceed to the next milestone after
                </StyledLabel>
                <span style={{ fontSize: 'inherit' }}>
                    {initial.value} {initial.unit}
                </span>
                <StyledLabel status={status}>from milestone start</StyledLabel>
            </StyledContentGroup>
        </StyledDisplayContainer>
    );
};

export const MilestoneTransitionDisplay = ({
    intervalMinutes,
    targetMilestoneId,
    sourceMilestoneStartedAt,
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
        sourceMilestoneStartedAt,
        status,
    );

    const currentIntervalMinutes = form.getIntervalMinutes();
    const hasChanged = currentIntervalMinutes !== intervalMinutes;

    const progressionInfo = useMilestoneProgressionInfo(
        currentIntervalMinutes,
        sourceMilestoneStartedAt ?? null,
        status,
    );

    useEffect(() => {
        const newInitial = getTimeValueAndUnitFromMinutes(intervalMinutes);
        form.setTimeValue(newInitial.value);
        form.setTimeUnit(newInitial.unit);
    }, [intervalMinutes]);

    useEffect(() => {
        if (!hasChanged) {
            form.clearErrors();
        }
    }, [hasChanged, form.clearErrors]);

    const handleSave = async () => {
        if (!hasChanged) return;

        if (!form.validate()) {
            return;
        }

        const payload: ChangeMilestoneProgressionSchema = {
            targetMilestone: targetMilestoneId,
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
        form.clearErrors();
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
        <StyledFormWrapper hasChanged={hasChanged} onKeyDown={handleKeyDown}>
            <StyledDisplayContainer>
                <StyledContentGroup>
                    <StyledIcon status={status} />
                    <StyledLabel status={status}>Proceed after</StyledLabel>
                    <MilestoneProgressionTimeInput
                        timeValue={form.timeValue}
                        timeUnit={form.timeUnit}
                        onTimeValueChange={form.handleTimeValueChange}
                        onTimeUnitChange={form.handleTimeUnitChange}
                    />
                    <StyledLabel status={status}>
                        from milestone start
                    </StyledLabel>
                </StyledContentGroup>
                {!hasChanged && (
                    <StyledButtonGroup hasChanged={false}>
                        {badge}
                        <PermissionIconButton
                            permission={UPDATE_FEATURE_STRATEGY}
                            onClick={onDelete}
                            size='small'
                            aria-label={`Delete automation for ${milestoneName}`}
                            sx={{ padding: 0.5 }}
                        >
                            <DeleteOutlineIcon fontSize='small' />
                        </PermissionIconButton>
                    </StyledButtonGroup>
                )}
            </StyledDisplayContainer>
            {progressionInfo && (
                <StyledInfoLine>{progressionInfo}</StyledInfoLine>
            )}
            {form.errors.time && (
                <StyledErrorMessage>{form.errors.time}</StyledErrorMessage>
            )}
            {hasChanged && (
                <StyledButtonGroup hasChanged={true}>
                    <Button
                        variant='outlined'
                        color='primary'
                        onClick={handleReset}
                        size='small'
                    >
                        Cancel
                    </Button>
                    <PermissionButton
                        permission={UPDATE_FEATURE_STRATEGY}
                        variant='contained'
                        color='primary'
                        onClick={handleSave}
                        size='small'
                    >
                        Save
                    </PermissionButton>
                </StyledButtonGroup>
            )}
        </StyledFormWrapper>
    );
};
