import { useId } from 'react';
import { FormControlLabel, Radio, RadioGroup, Typography } from '@mui/material';

export type TriggerMode = 'always' | 'custom';

interface SurveyTriggerStepProps {
    mode: TriggerMode;
    onModeChange: (mode: TriggerMode) => void;
}

export const SurveyTriggerStep = ({
    mode,
    onModeChange,
}: SurveyTriggerStepProps) => {
    const headingId = useId();

    return (
        <section aria-labelledby={headingId}>
            <Typography id={headingId} variant='h3' component='h2'>
                When to show the survey
            </Typography>
            <RadioGroup
                aria-labelledby={headingId}
                value={mode}
                onChange={(_, value) => onModeChange(value as TriggerMode)}
            >
                <FormControlLabel
                    value='always'
                    control={<Radio />}
                    label='Whenever the survey is enabled'
                />
                <FormControlLabel
                    value='custom'
                    control={<Radio />}
                    label='When something happens'
                />
            </RadioGroup>
        </section>
    );
};
