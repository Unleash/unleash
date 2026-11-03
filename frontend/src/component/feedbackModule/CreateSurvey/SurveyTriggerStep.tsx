import { useId, useState } from 'react';
import Cancel from '@mui/icons-material/Cancel';
import CheckCircle from '@mui/icons-material/CheckCircle';
import {
    FormControlLabel,
    Radio,
    RadioGroup,
    styled,
    Typography,
} from '@mui/material';
import GeneralSelect from 'component/common/GeneralSelect/GeneralSelect';
import Input from 'component/common/Input/Input';
import { canMatchPages } from '../triggers/pagePattern.ts';
import type { TriggerCondition } from '../triggers/surveyTrigger.ts';
import {
    matchPage,
    type PageMatch,
    type TriggerDraft,
    type TriggerErrors,
    type TriggerMode,
} from './triggerDraft.ts';

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

const StyledField = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
}));

const StyledHalfWidth = styled('div')(({ theme }) => ({
    width: '50%',
    [theme.breakpoints.down('sm')]: {
        width: '100%',
    },
}));

const StyledGuidance = styled('div')(({ theme }) => ({
    padding: theme.spacing(1.5, 2),
    borderRadius: theme.shape.borderRadius,
    backgroundColor: theme.palette.background.elevation1,
    fontSize: theme.typography.body2.fontSize,
    color: theme.palette.text.secondary,
    '& p, & ul': { margin: 0 },
    '& ul': { paddingLeft: theme.spacing(2.5) },
    '& li + li': { marginTop: theme.spacing(0.5) },
    '& code': {
        fontSize: theme.typography.body2.fontSize,
        color: theme.palette.text.primary,
    },
}));

const StyledTester = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
    marginTop: theme.spacing(2),
    '& .MuiOutlinedInput-root': {
        backgroundColor: theme.palette.background.paper,
    },
}));

const StyledMatch = styled('div', {
    shouldForwardProp: (prop) => prop !== 'matched',
})<{ matched: boolean }>(({ theme, matched }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
    minHeight: theme.spacing(3),
    color: matched ? theme.palette.success.main : theme.palette.text.primary,
}));

const TRIGGER_OPTIONS: { key: TriggerCondition['on']; label: string }[] = [
    { key: 'page', label: 'The user opens a page' },
];

const MATCH_MESSAGES: Record<PageMatch, string> = {
    match: 'Matches. The survey can show on this page.',
    'match-every-page': 'Matches. An empty pattern matches every page.',
    'no-match': 'Does not match this URL.',
    'invalid-pattern': 'Fix the page pattern to try it.',
    'invalid-url': 'Enter a full URL or a path starting with /.',
};

const PageTester = ({ page }: { page: string }) => {
    const [url, setUrl] = useState('');
    const match = url.trim() === '' ? null : matchPage(page, url);
    const matched = match === 'match' || match === 'match-every-page';

    return (
        <StyledTester>
            <Input
                label='Try a URL'
                placeholder='https://app.example.com/projects/default'
                value={url}
                onChange={(event) => setUrl(event.target.value)}
                fullWidth
            />
            <StyledMatch role='status' matched={matched}>
                {match === null ? null : (
                    <>
                        {matched ? (
                            <CheckCircle fontSize='small' />
                        ) : (
                            <Cancel fontSize='small' />
                        )}
                        {MATCH_MESSAGES[match]}
                    </>
                )}
            </StyledMatch>
        </StyledTester>
    );
};

const PageGuidance = ({ page }: { page: string }) => (
    <StyledGuidance>
        <p>
            <strong>Writing a page pattern</strong>
        </p>
        <ul>
            <li>
                Match the path only. The domain, <code>?query</code> and{' '}
                <code>#hash</code> are ignored.
            </li>
            <li>
                <code>:name</code> matches one segment and <code>*</code>{' '}
                matches the rest of the path.
            </li>
            <li>
                <code>/projects/:projectId</code> matches every project
                overview.
            </li>
            <li>
                <code>/projects/:projectId/features/:featureId</code> matches
                every flag page.
            </li>
            <li>
                <code>/projects/*</code> matches every page under projects.
            </li>
        </ul>
        {canMatchPages() ? <PageTester page={page} /> : null}
    </StyledGuidance>
);

interface CustomTriggerProps {
    trigger: TriggerDraft;
    errors: TriggerErrors;
    onChange: (trigger: TriggerDraft) => void;
}

const CustomTrigger = ({ trigger, errors, onChange }: CustomTriggerProps) => {
    const [delayMs, setDelayMs] = useState('0');
    const [occurrence, setOccurrence] = useState('1');

    return (
        <StyledCard>
            <StyledHalfWidth>
                <GeneralSelect
                    label='Show the survey when'
                    value={trigger.on}
                    onChange={(on: TriggerCondition['on']) =>
                        onChange({ ...trigger, on })
                    }
                    options={TRIGGER_OPTIONS}
                    fullWidth
                />
            </StyledHalfWidth>
            <StyledField>
                <Input
                    label='Page'
                    description='Optional. Leave empty to match every page.'
                    placeholder='/projects/:projectId'
                    value={trigger.path}
                    onChange={(event) =>
                        onChange({ ...trigger, path: event.target.value })
                    }
                    error={Boolean(errors.path)}
                    errorText={errors.path}
                    fullWidth
                />
                <PageGuidance page={trigger.path} />
            </StyledField>
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
    draft: TriggerDraft;
    errors: TriggerErrors;
    onChange: (draft: TriggerDraft) => void;
}

export const SurveyTriggerStep = ({
    draft,
    errors,
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
                value={draft.mode}
                onChange={(_, value) =>
                    onChange({ ...draft, mode: value as TriggerMode })
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
            {draft.mode === 'custom' ? (
                <CustomTrigger
                    trigger={draft}
                    errors={errors}
                    onChange={onChange}
                />
            ) : null}
        </section>
    );
};
