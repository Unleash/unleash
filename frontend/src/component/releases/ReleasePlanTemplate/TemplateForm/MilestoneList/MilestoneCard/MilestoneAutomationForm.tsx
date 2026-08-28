import Add from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlineOutlined';
import { IconButton, styled } from '@mui/material';
import { useTransitionConditionInput } from 'component/feature/FeatureView/FeatureOverview/ReleasePlan/hooks/useTransitionConditionInput';
import { StyledErrorMessage } from 'component/feature/FeatureView/FeatureOverview/ReleasePlan/shared/SharedFormComponents';
import { TransitionConditionRow } from 'component/feature/FeatureView/FeatureOverview/ReleasePlan/shared/TransitionConditionRow';
import { TransitionConditionInput } from 'component/feature/FeatureView/FeatureOverview/ReleasePlan/MilestoneProgressionForm/TransitionConditionInput';
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
    const { value, unit, condition, handleValueChange, handleUnitChange } =
        useTransitionConditionInput(transitionCondition, onChange);

    if (!transitionCondition) {
        return (
            <StyledAutomationSection>
                <StyledActionButton
                    variant='text'
                    color='primary'
                    startIcon={<Add />}
                    onClick={() => onChange(condition)}
                >
                    Automate this transition
                </StyledActionButton>
            </StyledAutomationSection>
        );
    }

    return (
        <StyledAutomationSection>
            <TransitionConditionRow
                type={condition.type}
                condition={
                    <TransitionConditionInput
                        value={value}
                        unit={unit}
                        onValueChange={handleValueChange}
                        onUnitChange={handleUnitChange}
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
