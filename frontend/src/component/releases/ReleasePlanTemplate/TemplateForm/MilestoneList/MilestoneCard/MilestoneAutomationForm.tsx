import Add from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlineOutlined';
import { IconButton, styled } from '@mui/material';
import { useTransitionConditionInput } from 'component/feature/FeatureView/FeatureOverview/ReleasePlan/hooks/useTransitionConditionInput';
import { StyledErrorMessage } from 'component/feature/FeatureView/FeatureOverview/ReleasePlan/shared/SharedFormComponents';
import { TransitionConditionRow } from 'component/feature/FeatureView/FeatureOverview/ReleasePlan/shared/TransitionConditionRow';
import { MilestoneProgressionTimeInput } from 'component/feature/FeatureView/FeatureOverview/ReleasePlan/MilestoneProgressionForm/MilestoneProgressionTimeInput';
import type { TransitionConditionSchema } from 'openapi';
import { StyledActionButton } from 'component/feature/FeatureView/FeatureOverview/ReleasePlan/ReleasePlanMilestoneItem/StyledActionButton';

const StyledAutomationSection = styled('div')(({ theme }) => ({
    marginTop: theme.spacing(1),
}));

const StyledAutomationError = styled(StyledErrorMessage)(({ theme }) => ({
    fontSize: theme.typography.caption.fontSize,
}));

interface MilestoneAutomationFormProps {
    milestoneName: string;
    transitionCondition: TransitionConditionSchema | undefined;
    onChange: (
        transitionCondition: TransitionConditionSchema | undefined,
    ) => void;
    error?: string;
}

export const MilestoneAutomationForm = ({
    milestoneName,
    transitionCondition,
    onChange,
    error,
}: MilestoneAutomationFormProps) => {
    const {
        timeValue,
        timeUnit,
        intervalMinutes,
        handleTimeValueChange,
        handleTimeUnitChange,
    } = useTransitionConditionInput(
        transitionCondition?.intervalMinutes,
        (intervalMinutes) => onChange({ intervalMinutes }),
    );

    if (!transitionCondition) {
        return (
            <StyledAutomationSection>
                <StyledActionButton
                    variant='text'
                    color='primary'
                    startIcon={<Add />}
                    onClick={() => onChange({ intervalMinutes })}
                >
                    Automate this transition
                </StyledActionButton>
            </StyledAutomationSection>
        );
    }

    return (
        <StyledAutomationSection>
            <TransitionConditionRow
                condition={
                    <MilestoneProgressionTimeInput
                        timeValue={timeValue}
                        timeUnit={timeUnit}
                        onTimeValueChange={handleTimeValueChange}
                        onTimeUnitChange={handleTimeUnitChange}
                        error={Boolean(error)}
                    />
                }
                endActions={
                    <IconButton
                        onClick={() => onChange(undefined)}
                        size='medium'
                        aria-label={`Remove automation for ${milestoneName}`}
                        title={`Remove automation for ${milestoneName}`}
                    >
                        <DeleteOutlineIcon />
                    </IconButton>
                }
            />
            {error ? (
                <StyledAutomationError>{error}</StyledAutomationError>
            ) : null}
        </StyledAutomationSection>
    );
};
