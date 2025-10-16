import { useState } from 'react';
import { Button, styled } from '@mui/material';
import BoltIcon from '@mui/icons-material/Bolt';
import { useMilestoneProgressionForm } from '../hooks/useMilestoneProgressionForm.js';
import { useMilestoneProgressionsApi } from 'hooks/api/actions/useMilestoneProgressionsApi/useMilestoneProgressionsApi';
import useToast from 'hooks/useToast';
import { formatUnknownError } from 'utils/formatUnknownError';
import { MilestoneProgressionTimeInput } from './MilestoneProgressionTimeInput.tsx';
import { useChangeRequestsEnabled } from 'hooks/useChangeRequestsEnabled';
import type { CreateMilestoneProgressionSchema } from 'openapi';

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
    marginRight: 'auto',
}));

interface IMilestoneProgressionFormProps {
    sourceMilestoneId: string;
    targetMilestoneId: string;
    projectId: string;
    environment: string;
    featureName: string;
    onSave: () => void;
    onCancel: () => void;
    onChangeRequestSubmit?: (
        progressionPayload: CreateMilestoneProgressionSchema,
    ) => void;
}

export const MilestoneProgressionForm = ({
    sourceMilestoneId,
    targetMilestoneId,
    projectId,
    environment,
    featureName,
    onSave,
    onCancel,
    onChangeRequestSubmit,
}: IMilestoneProgressionFormProps) => {
    const form = useMilestoneProgressionForm(
        sourceMilestoneId,
        targetMilestoneId,
    );
    const { createMilestoneProgression } = useMilestoneProgressionsApi();
    const { setToastData, setToastApiError } = useToast();
    const { isChangeRequestConfigured } = useChangeRequestsEnabled(projectId);

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChangeRequestSubmit = () => {
        const progressionPayload = form.getProgressionPayload();
        onChangeRequestSubmit?.(progressionPayload);
    };

    const handleDirectSubmit = async () => {
        setIsSubmitting(true);
        try {
            await createMilestoneProgression(
                projectId,
                environment,
                featureName,
                form.getProgressionPayload(),
            );
            setToastData({
                type: 'success',
                text: 'Automation configured successfully',
            });
            onSave();
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSubmit = async () => {
        if (isSubmitting) return;

        if (!form.validate()) {
            return;
        }

        if (isChangeRequestConfigured(environment) && onChangeRequestSubmit) {
            handleChangeRequestSubmit();
        } else {
            await handleDirectSubmit();
        }
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
                    disabled={isSubmitting}
                />
            </StyledTopRow>
            <StyledButtonGroup>
                {form.errors.time && (
                    <StyledErrorMessage>{form.errors.time}</StyledErrorMessage>
                )}
                <Button
                    variant='outlined'
                    onClick={onCancel}
                    size='small'
                    disabled={isSubmitting}
                >
                    Cancel
                </Button>
                <Button
                    variant='contained'
                    color='primary'
                    onClick={handleSubmit}
                    size='small'
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Saving...' : 'Save'}
                </Button>
            </StyledButtonGroup>
        </StyledFormContainer>
    );
};
