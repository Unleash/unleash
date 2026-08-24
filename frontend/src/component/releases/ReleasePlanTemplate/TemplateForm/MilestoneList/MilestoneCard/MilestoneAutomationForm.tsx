import Add from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlineOutlined';
import { Button, IconButton, styled } from '@mui/material';
import { useState } from 'react';
import type { SelectChangeEvent } from '@mui/material';
import {
    getMinutesFromTimeValueAndUnit,
    getTimeValueAndUnitFromMinutes,
    type TimeUnit,
} from 'component/feature/FeatureView/FeatureOverview/ReleasePlan/hooks/useMilestoneProgressionForm';
import { StyledErrorMessage } from 'component/feature/FeatureView/FeatureOverview/ReleasePlan/shared/SharedFormComponents';
import { TransitionConditionRow } from 'component/feature/FeatureView/FeatureOverview/ReleasePlan/shared/TransitionConditionRow';
import { MilestoneProgressionTimeInput } from 'component/feature/FeatureView/FeatureOverview/ReleasePlan/MilestoneProgressionForm/MilestoneProgressionTimeInput';
import type { TransitionConditionSchema } from 'openapi';

const DEFAULT_INTERVAL_MINUTES = 5 * 60;
const MAX_TIME_VALUE = 10000;

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
    const initial = getTimeValueAndUnitFromMinutes(
        transitionCondition?.intervalMinutes ?? DEFAULT_INTERVAL_MINUTES,
    );
    const [timeValue, setTimeValue] = useState(initial.value);
    const [timeUnit, setTimeUnit] = useState<TimeUnit>(initial.unit);

    if (!transitionCondition) {
        return (
            <StyledAutomationSection>
                <Button
                    variant='text'
                    color='primary'
                    startIcon={<Add />}
                    onClick={() => {
                        onChange({
                            intervalMinutes: getMinutesFromTimeValueAndUnit({
                                value: timeValue,
                                unit: timeUnit,
                            }),
                        });
                    }}
                >
                    Add automation
                </Button>
            </StyledAutomationSection>
        );
    }

    const handleTimeValueChange = (
        event: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const value = Math.min(Number(event.target.value), MAX_TIME_VALUE);
        setTimeValue(value);
        onChange({
            intervalMinutes: getMinutesFromTimeValueAndUnit({
                value,
                unit: timeUnit,
            }),
        });
    };

    const handleTimeUnitChange = (event: SelectChangeEvent<unknown>) => {
        const unit = event.target.value as TimeUnit;
        setTimeUnit(unit);
        onChange({
            intervalMinutes: getMinutesFromTimeValueAndUnit({
                value: timeValue,
                unit,
            }),
        });
    };

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
