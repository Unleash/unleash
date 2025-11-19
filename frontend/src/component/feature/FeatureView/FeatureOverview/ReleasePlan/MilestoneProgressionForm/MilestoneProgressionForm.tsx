import { Button } from '@mui/material';
import BoltIcon from '@mui/icons-material/Bolt';
import { useMilestoneProgressionForm } from '../hooks/useMilestoneProgressionForm.js';
import { MilestoneProgressionTimeInput } from './MilestoneProgressionTimeInput.tsx';
import type { ChangeMilestoneProgressionSchema } from 'openapi';
import type { MilestoneStatus } from '../ReleasePlanMilestone/ReleasePlanMilestoneStatus.tsx';
import { useMilestoneProgressionInfo } from '../hooks/useMilestoneProgressionInfo.ts';
import {
    StyledFormContainer,
    StyledTopRow,
    StyledLabel,
    StyledButtonGroup,
    StyledErrorMessage,
    StyledInfoLine,
    createStyledIcon,
} from '../shared/SharedFormComponents.tsx';

const StyledIcon = createStyledIcon(BoltIcon);

interface IMilestoneProgressionFormProps {
    sourceMilestoneId: string;
    targetMilestoneId: string;
    sourceMilestoneStartedAt?: string | null;
    status?: MilestoneStatus;
    onSubmit: (
        payload: ChangeMilestoneProgressionSchema,
    ) => Promise<{ shouldReset?: boolean }>;
    onCancel: () => void;
    isPaused?: boolean;
}

export const MilestoneProgressionForm = ({
    sourceMilestoneId,
    targetMilestoneId,
    sourceMilestoneStartedAt,
    status,
    onSubmit,
    onCancel,
    isPaused = false,
}: IMilestoneProgressionFormProps) => {
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
        isPaused,
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
            <StyledTopRow>
                <StyledIcon />
                <StyledLabel>Proceed after</StyledLabel>
                <MilestoneProgressionTimeInput
                    timeValue={form.timeValue}
                    timeUnit={form.timeUnit}
                    onTimeValueChange={form.handleTimeValueChange}
                    onTimeUnitChange={form.handleTimeUnitChange}
                />
                <StyledLabel>from milestone start</StyledLabel>
            </StyledTopRow>
            {progressionInfo && (
                <StyledInfoLine>{progressionInfo}</StyledInfoLine>
            )}
            {form.errors.time && (
                <StyledErrorMessage>{form.errors.time}</StyledErrorMessage>
            )}
            <StyledButtonGroup>
                <Button variant='outlined' onClick={onCancel} size='small'>
                    Cancel
                </Button>
                <Button
                    variant='contained'
                    color='primary'
                    size='small'
                    type='submit'
                >
                    Save
                </Button>
            </StyledButtonGroup>
        </StyledFormContainer>
    );
};
