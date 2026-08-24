import Add from '@mui/icons-material/Add';
import BoltIcon from '@mui/icons-material/Bolt';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlineOutlined';
import { Button, IconButton, styled } from '@mui/material';
import { useState } from 'react';
import type { SelectChangeEvent } from '@mui/material';
import { MilestoneProgressionTimeInput } from 'component/feature/FeatureView/FeatureOverview/ReleasePlan/MilestoneProgressionForm/MilestoneProgressionTimeInput';
import {
    getMinutesFromTimeValueAndUnit,
    getTimeValueAndUnitFromMinutes,
    type TimeUnit,
} from 'component/feature/FeatureView/FeatureOverview/ReleasePlan/hooks/useMilestoneProgressionForm';
import {
    createStyledIcon,
    StyledErrorMessage,
    StyledLabel,
    StyledTopRow,
} from 'component/feature/FeatureView/FeatureOverview/ReleasePlan/shared/SharedFormComponents';
import type { TransitionConditionSchema } from 'openapi';

const DEFAULT_INTERVAL_MINUTES = 5 * 60;
const MAX_TIME_VALUE = 10000;

const StyledRow = styled(StyledTopRow)(({ theme }) => ({
    marginTop: theme.spacing(1),
}));

const StyledIcon = createStyledIcon(BoltIcon);

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
            <StyledRow>
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
            </StyledRow>
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
        <div>
            <StyledRow>
                <StyledIcon />
                <StyledLabel>Proceed after</StyledLabel>
                <MilestoneProgressionTimeInput
                    timeValue={timeValue}
                    timeUnit={timeUnit}
                    onTimeValueChange={handleTimeValueChange}
                    onTimeUnitChange={handleTimeUnitChange}
                    error={Boolean(error)}
                />
                <StyledLabel>from milestone start</StyledLabel>
                <IconButton
                    onClick={() => onChange(undefined)}
                    size='medium'
                    aria-label={`Remove automation for ${milestoneName}`}
                    title={`Remove automation for ${milestoneName}`}
                >
                    <DeleteOutlineIcon />
                </IconButton>
            </StyledRow>
            {error ? (
                <StyledAutomationError>{error}</StyledAutomationError>
            ) : null}
        </div>
    );
};
