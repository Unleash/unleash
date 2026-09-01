import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlineOutlined';
import { Button, styled } from '@mui/material';
import type { MilestoneStatus } from './ReleasePlanMilestoneStatus.tsx';
import {
    ReadonlyTransitionConditionRow,
    TransitionConditionRow,
} from '../shared/TransitionConditionRow.tsx';
import { TransitionConditionInput } from '../MilestoneProgressionForm/TransitionConditionInput.tsx';
import { getValueAndUnitFromCondition } from '../hooks/useTransitionConditionInput.ts';
import { useTransitionConditionForm } from '../hooks/useTransitionConditionForm.ts';
import { isSameCondition } from '../utils/isSameCondition.ts';
import { isTimeCondition } from 'interfaces/releasePlans';
import type {
    ChangeMilestoneProgressionSchema,
    TransitionConditionSchema,
} from 'openapi';
import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { TimeProgressionInfo } from '../shared/TimeProgressionInfo.tsx';
import { UPDATE_FEATURE_STRATEGY } from 'component/providers/AccessProvider/permissions.ts';
import PermissionButton from 'component/common/PermissionButton/PermissionButton.tsx';
import PermissionIconButton from 'component/common/PermissionIconButton/PermissionIconButton.tsx';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam.ts';

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

interface IMilestoneTransitionDisplayProps {
    transitionCondition: TransitionConditionSchema;
    targetMilestoneId: string;
    sourceMilestoneStartedAt?: string | null;
    onSave: (
        payload: ChangeMilestoneProgressionSchema,
    ) => Promise<{ shouldReset?: boolean }>;
    onDelete: () => void;
    milestoneName: string;
    status?: MilestoneStatus;
    badge?: ReactNode;
    environment: string;
}

export const ReadonlyMilestoneTransitionDisplay = ({
    transitionCondition,
    status,
}: {
    transitionCondition: TransitionConditionSchema;
    status?: MilestoneStatus;
}) => {
    const initial = getValueAndUnitFromCondition(transitionCondition);

    return (
        <ReadonlyTransitionConditionRow
            muted={status?.type === 'completed'}
            label='Proceed to the next milestone after'
            type={transitionCondition.type}
            value={`${initial.value} ${initial.unit}`}
        />
    );
};

export const MilestoneTransitionDisplay = ({
    transitionCondition,
    targetMilestoneId,
    sourceMilestoneStartedAt,
    onSave,
    onDelete,
    milestoneName,
    status,
    badge,
    environment,
}: IMilestoneTransitionDisplayProps) => {
    const projectId = useRequiredPathParam('projectId');
    const { form, validation } = useTransitionConditionForm({
        initialCondition: transitionCondition,
        sourceMilestoneStartedAt,
        status,
    });

    const initial = getValueAndUnitFromCondition(transitionCondition);
    const hasChanged = !isSameCondition(form.condition, transitionCondition);

    useEffect(() => {
        form.setValue(initial.value);
        form.setUnit(initial.unit);
    }, [initial.value, initial.unit]);

    useEffect(() => {
        if (!hasChanged) {
            validation.clearError();
        }
    }, [hasChanged, validation.clearError]);

    const handleSave = async () => {
        if (!hasChanged) return;

        if (!validation.validate()) {
            return;
        }

        const payload: ChangeMilestoneProgressionSchema = {
            targetMilestone: targetMilestoneId,
            transitionCondition: form.condition,
        };

        const result = await onSave(payload);

        if (result?.shouldReset) {
            handleReset();
        }
    };

    const handleReset = () => {
        form.setValue(initial.value);
        form.setUnit(initial.unit);
        validation.clearError();
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
            <TransitionConditionRow
                type={form.condition.type}
                condition={
                    <TransitionConditionInput
                        value={form.value}
                        unit={form.unit}
                        onValueChange={form.handleValueChange}
                        onUnitChange={form.handleUnitChange}
                    />
                }
                muted={status?.type === 'completed'}
                endActions={
                    !hasChanged && (
                        <StyledButtonGroup hasChanged={false}>
                            {badge}
                            <PermissionIconButton
                                permission={UPDATE_FEATURE_STRATEGY}
                                projectId={projectId}
                                environmentId={environment}
                                onClick={onDelete}
                                size='medium'
                                aria-label={`Remove automation for ${milestoneName}`}
                                tooltipProps={{
                                    title: `Remove automation for ${milestoneName}`,
                                }}
                                sx={{ padding: 0.5 }}
                            >
                                <DeleteOutlineIcon />
                            </PermissionIconButton>
                        </StyledButtonGroup>
                    )
                }
            />
            {isTimeCondition(form.condition) && (
                <TimeProgressionInfo
                    intervalMinutes={form.condition.intervalMinutes}
                    sourceMilestoneStartedAt={sourceMilestoneStartedAt}
                    status={status}
                />
            )}
            {validation.error && (
                <StyledErrorMessage>{validation.error}</StyledErrorMessage>
            )}
            {hasChanged && (
                <StyledButtonGroup hasChanged={true}>
                    <Button
                        variant='outlined'
                        color='primary'
                        onClick={handleReset}
                        size='medium'
                    >
                        Cancel
                    </Button>
                    <PermissionButton
                        permission={UPDATE_FEATURE_STRATEGY}
                        projectId={projectId}
                        environmentId={environment}
                        variant='contained'
                        color='primary'
                        onClick={handleSave}
                        size='medium'
                    >
                        Save
                    </PermissionButton>
                </StyledButtonGroup>
            )}
        </StyledFormWrapper>
    );
};
