import { Button } from '@mui/material';
import { useMilestoneProgressionForm } from '../hooks/useMilestoneProgressionForm.js';
import type { ChangeMilestoneProgressionSchema } from 'openapi';
import type { MilestoneStatus } from '../ReleasePlanMilestone/ReleasePlanMilestoneStatus.tsx';
import { useMilestoneProgressionInfo } from '../hooks/useMilestoneProgressionInfo.ts';
import {
    StyledFormContainer,
    StyledButtonGroup,
    StyledErrorMessage,
    StyledInfoLine,
} from '../shared/SharedFormComponents.tsx';
import { TransitionConditionRow } from '../shared/TransitionConditionRow.tsx';
import { MilestoneProgressionTimeInput } from './MilestoneProgressionTimeInput.tsx';
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
}

export const MilestoneProgressionForm = ({
    sourceMilestoneId,
    targetMilestoneId,
    sourceMilestoneStartedAt,
    status,
    onSubmit,
    onCancel,
    environment,
}: IMilestoneProgressionFormProps) => {
    const projectId = useRequiredPathParam('projectId');

    const form = useMilestoneProgressionForm(
        sourceMilestoneId,
        targetMilestoneId,
        {},
        sourceMilestoneStartedAt,
        status,
    );

    const progressionInfo = useMilestoneProgressionInfo(
        form.getIntervalMinutes(),
        sourceMilestoneStartedAt,
        status,
    );

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!form.validate()) {
            return;
        }

        await onSubmit(form.getProgressionPayload());
    };

    return (
        <StyledFormContainer onSubmit={handleSubmit}>
            <TransitionConditionRow
                condition={
                    <MilestoneProgressionTimeInput
                        timeValue={form.timeValue}
                        timeUnit={form.timeUnit}
                        onTimeValueChange={form.handleTimeValueChange}
                        onTimeUnitChange={form.handleTimeUnitChange}
                    />
                }
            />
            {progressionInfo && (
                <StyledInfoLine>{progressionInfo}</StyledInfoLine>
            )}
            {form.errors.time && (
                <StyledErrorMessage>{form.errors.time}</StyledErrorMessage>
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
