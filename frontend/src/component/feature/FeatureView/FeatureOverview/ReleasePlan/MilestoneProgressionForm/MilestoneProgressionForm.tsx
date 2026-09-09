import { Button } from '@mui/material';
import { useTransitionConditionForm } from '../hooks/useTransitionConditionForm.ts';
import { useExposureProgress } from '../hooks/useExposureProgress.ts';
import type { ChangeMilestoneProgressionSchema } from 'openapi';
import { isTimeCondition } from 'interfaces/releasePlans';
import { ExposureProgress } from '../shared/ExposureProgress.tsx';
import type { MilestoneStatus } from '../ReleasePlanMilestone/ReleasePlanMilestoneStatus.tsx';
import { TimeProgressionInfo } from '../shared/TimeProgressionInfo.tsx';
import {
    StyledFormContainer,
    StyledButtonGroup,
    StyledErrorMessage,
} from '../shared/SharedFormComponents.tsx';
import { TransitionConditionRow } from '../shared/TransitionConditionRow.tsx';
import { TransitionConditionInput } from './TransitionConditionInput.tsx';
import PermissionButton from 'component/common/PermissionButton/PermissionButton.tsx';
import { UPDATE_FEATURE_STRATEGY } from 'component/providers/AccessProvider/permissions.ts';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam.ts';

interface IMilestoneProgressionFormProps {
    sourceMilestoneId: string;
    targetMilestoneId: string;
    sourceMilestoneStartedAt?: string | null;
    status?: MilestoneStatus;
    onSubmit: (
        payload: ChangeMilestoneProgressionSchema,
    ) => Promise<{ shouldReset?: boolean }>;
    onCancel: () => void;
    environment: string;
    featureName: string;
}

export const MilestoneProgressionForm = ({
    sourceMilestoneId,
    targetMilestoneId,
    sourceMilestoneStartedAt,
    status,
    onSubmit,
    onCancel,
    environment,
    featureName,
}: IMilestoneProgressionFormProps) => {
    const projectId = useRequiredPathParam('projectId');

    const { form, validation } = useTransitionConditionForm({
        sourceMilestoneStartedAt,
        status,
    });
    const exposureProgress = useExposureProgress({
        condition: form.condition,
        environment,
        featureName,
    });

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!validation.validate()) {
            return;
        }

        await onSubmit({
            sourceMilestone: sourceMilestoneId,
            targetMilestone: targetMilestoneId,
            transitionCondition: form.condition,
        });
    };

    return (
        <StyledFormContainer onSubmit={handleSubmit}>
            <TransitionConditionRow
                type={form.condition.type}
                conditionInfo={
                    exposureProgress && (
                        <ExposureProgress {...exposureProgress} />
                    )
                }
                condition={
                    <TransitionConditionInput
                        value={form.value}
                        unit={form.unit}
                        onValueChange={form.handleValueChange}
                        onUnitChange={form.handleUnitChange}
                    />
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
            <StyledButtonGroup>
                <Button variant='outlined' onClick={onCancel} size='medium'>
                    Cancel
                </Button>
                <PermissionButton
                    permission={UPDATE_FEATURE_STRATEGY}
                    projectId={projectId}
                    environmentId={environment}
                    type='submit'
                    variant='contained'
                    color='primary'
                    size='medium'
                >
                    Save
                </PermissionButton>
            </StyledButtonGroup>
        </StyledFormContainer>
    );
};
