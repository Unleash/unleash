import { useId, useState } from 'react';
import {
    FormControlLabel,
    Radio,
    RadioGroup,
    styled,
    Typography,
} from '@mui/material';
import GeneralSelect from 'component/common/GeneralSelect/GeneralSelect';
import Input from 'component/common/Input/Input';
import type { Condition } from '../survey.ts';
import type { SurveyDraft, TriggerDraft, TriggerMode } from './surveyDraft.ts';

const StyledCard = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(3),
    marginTop: theme.spacing(2),
    padding: theme.spacing(2),
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadiusLarge,
    backgroundColor: theme.palette.background.paper,
}));

const StyledHalfWidth = styled('div')(({ theme }) => ({
    width: '50%',
    [theme.breakpoints.down('sm')]: {
        width: '100%',
    },
}));

const TRIGGER_OPTIONS: { key: Condition['on']; label: string }[] = [
    { key: 'page', label: 'The user opens a page' },
];

interface PageTriggerProps {
    trigger: TriggerDraft;
    onChange: (trigger: TriggerDraft) => void;
}

const PageTrigger = ({ trigger, onChange }: PageTriggerProps) => {
    const [delayMs, setDelayMs] = useState('0');
    const [occurrence, setOccurrence] = useState('1');

    return (
        <StyledCard>
            <StyledHalfWidth>
                <GeneralSelect
                    label='Show the survey when'
                    value={trigger.on}
                    onChange={(on: Condition['on']) =>
                        onChange({ ...trigger, on })
                    }
                    options={TRIGGER_OPTIONS}
                    fullWidth
                />
            </StyledHalfWidth>
            <Input
                label='Page'
                description='Optional. Leave empty to match every page.'
                placeholder='/projects/:projectId'
                value={trigger.path}
                onChange={(event) =>
                    onChange({ ...trigger, path: event.target.value })
                }
                fullWidth
            />
            <StyledHalfWidth>
                <Input
                    label='Delay in milliseconds'
                    description='Show the survey this long after the condition is met. 0 means immediately.'
                    type='number'
                    value={delayMs}
                    onChange={(event) => setDelayMs(event.target.value)}
                    fullWidth
                />
            </StyledHalfWidth>
            <StyledHalfWidth>
                <Input
                    label='Show after the condition is met this many times'
                    description="Counted separately in each user's browser. 1 shows the survey the first time; 3 waits until the third time."
                    type='number'
                    value={occurrence}
                    onChange={(event) => setOccurrence(event.target.value)}
                    fullWidth
                />
            </StyledHalfWidth>
        </StyledCard>
    );
};

interface SurveyTriggerStepProps {
    draft: SurveyDraft;
    onChange: (draft: SurveyDraft) => void;
}

export const SurveyTriggerStep = ({
    draft,
    onChange,
}: SurveyTriggerStepProps) => {
    const headingId = useId();

    return (
        <section aria-labelledby={headingId}>
            <Typography id={headingId} variant='h3' component='h2'>
                When to show the survey
            </Typography>
            <RadioGroup
                aria-labelledby={headingId}
                value={draft.triggerMode}
                onChange={(_, value) =>
                    onChange({ ...draft, triggerMode: value as TriggerMode })
                }
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
            {draft.triggerMode === 'custom' ? (
                <PageTrigger
                    trigger={draft.trigger}
                    onChange={(trigger) => onChange({ ...draft, trigger })}
                />
            ) : null}
        </section>
    );
};
