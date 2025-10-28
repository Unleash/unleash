import { Button, styled } from '@mui/material';
import BoltIcon from '@mui/icons-material/Bolt';
import { useMilestoneProgressionForm } from '../hooks/useMilestoneProgressionForm.js';
import { MilestoneProgressionTimeInput } from './MilestoneProgressionTimeInput.tsx';
import type { ChangeMilestoneProgressionSchema } from 'openapi';
import type { MilestoneStatus } from '../ReleasePlanMilestone/ReleasePlanMilestoneStatus.tsx';

const StyledFormContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1.5),
    padding: theme.spacing(1.5, 2),
    backgroundColor: theme.palette.background.elevation1,
    width: '100%',
    borderRadius: `${theme.shape.borderRadiusLarge}px`,
    position: 'relative',
}));

const StyledTopRow = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
}));

const StyledIcon = styled(BoltIcon)(({ theme }) => ({
    color: theme.palette.common.white,
    fontSize: 18,
    flexShrink: 0,
    backgroundColor: theme.palette.primary.main,
    borderRadius: '50%',
    padding: theme.spacing(0.25),
}));

const StyledLabel = styled('span')(({ theme }) => ({
    color: theme.palette.text.primary,
    fontSize: theme.typography.body2.fontSize,
    flexShrink: 0,
}));

const StyledButtonGroup = styled('div')(({ theme }) => ({
    display: 'flex',
    gap: theme.spacing(1),
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingTop: theme.spacing(1),
    marginTop: theme.spacing(0.5),
    borderTop: `1px solid ${theme.palette.divider}`,
}));

const StyledErrorMessage = styled('span')(({ theme }) => ({
    color: theme.palette.error.main,
    fontSize: theme.typography.body2.fontSize,
    paddingLeft: theme.spacing(3.25),
}));

interface IMilestoneProgressionFormProps {
    sourceMilestoneId: string;
    targetMilestoneId: string;
    sourceMilestoneStartedAt?: string | null;
    status?: MilestoneStatus;
    onSubmit: (
        payload: ChangeMilestoneProgressionSchema,
    ) => Promise<{ shouldReset?: boolean }>;
    onCancel: () => void;
}

export const MilestoneProgressionForm = ({
    sourceMilestoneId,
    targetMilestoneId,
    sourceMilestoneStartedAt,
    status,
    onSubmit,
    onCancel,
}: IMilestoneProgressionFormProps) => {
    const form = useMilestoneProgressionForm(
        sourceMilestoneId,
        targetMilestoneId,
        {},
        sourceMilestoneStartedAt,
        status,
    );

    const handleSubmit = async () => {
        if (!form.validate()) {
            return;
        }

        await onSubmit(form.getProgressionPayload());
    };

    const handleKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            handleSubmit();
        } else if (event.key === 'Escape') {
            event.preventDefault();
            onCancel();
        }
    };

    return (
        <StyledFormContainer onKeyDown={handleKeyDown}>
            <StyledTopRow>
                <StyledIcon />
                <StyledLabel>Proceed to the next milestone after</StyledLabel>
                <MilestoneProgressionTimeInput
                    timeValue={form.timeValue}
                    timeUnit={form.timeUnit}
                    onTimeValueChange={form.handleTimeValueChange}
                    onTimeUnitChange={form.handleTimeUnitChange}
                />
            </StyledTopRow>
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
                    onClick={handleSubmit}
                    size='small'
                >
                    Save
                </Button>
            </StyledButtonGroup>
        </StyledFormContainer>
    );
};
