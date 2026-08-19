import {
    type ElementType,
    type SyntheticEvent,
    useEffect,
    useId,
    useState,
} from 'react';
import {
    Button,
    Fade,
    FormControl,
    FormControlLabel,
    FormLabel,
    IconButton,
    Paper,
    Radio,
    RadioGroup,
    Rating,
    styled,
    TextField,
    Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleOutlined from '@mui/icons-material/CheckCircleOutlined';
import { markSurveySeen } from './seenSurveys.ts';
import type { SurveyConfig, SurveyQuestionConfig } from './surveys.ts';

const THANKS_VISIBLE_MS = 3000;

const StyledCard = styled(Paper)(({ theme }) => ({
    position: 'fixed',
    bottom: theme.spacing(3),
    right: theme.spacing(3),
    zIndex: theme.zIndex.tooltip,
    width: 360,
    maxWidth: `calc(100vw - ${theme.spacing(6)})`,
    maxHeight: `calc(100vh - ${theme.spacing(6)})`,
    overflowY: 'auto',
    padding: theme.spacing(3),
    borderRadius: theme.shape.borderRadiusLarge,
}));

const StyledCloseButton = styled(IconButton)(({ theme }) => ({
    position: 'absolute',
    top: theme.spacing(1),
    right: theme.spacing(1),
}));

const StyledForm = styled('form')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: theme.spacing(2.5),
    marginTop: theme.spacing(2),
}));

const StyledPrompt = styled(FormLabel)<{ component?: ElementType }>(
    ({ theme }) => ({
        color: theme.palette.text.primary,
        fontSize: theme.typography.body2.fontSize,
        fontWeight: theme.typography.fontWeightBold,
        marginBottom: theme.spacing(0.5),
    }),
);

const StyledRating = styled(Rating)(({ theme }) => ({
    fontSize: theme.spacing(4),
}));

const StyledThanks = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: theme.spacing(1.5),
    padding: theme.spacing(3, 2),
    textAlign: 'center',
}));

interface QuestionProps<Type extends SurveyQuestionConfig['type']> {
    question: Extract<SurveyQuestionConfig, { type: Type }>;
    value: string;
    onChange: (value: string) => void;
}

const RatingQuestion = ({
    question,
    value,
    onChange,
}: QuestionProps<'rating'>) => {
    const name = useId();
    return (
        <FormControl component='fieldset'>
            <StyledPrompt component='legend' required={question.required}>
                {question.prompt}
            </StyledPrompt>
            <StyledRating
                name={name}
                max={5}
                value={value === '' ? null : Number(value)}
                onChange={(_, rating) =>
                    onChange(rating === null ? '' : String(rating))
                }
            />
        </FormControl>
    );
};

const SingleChoiceQuestion = ({
    question,
    value,
    onChange,
}: QuestionProps<'single'>) => (
    <FormControl component='fieldset'>
        <StyledPrompt component='legend' required={question.required}>
            {question.prompt}
        </StyledPrompt>
        <RadioGroup
            value={value}
            onChange={(event) => onChange(event.target.value)}
        >
            {question.options.map((option) => (
                <FormControlLabel
                    key={option}
                    value={option}
                    label={option}
                    control={<Radio size='small' />}
                    slotProps={{ typography: { variant: 'body2' } }}
                />
            ))}
        </RadioGroup>
    </FormControl>
);

const TextQuestion = ({ question, value, onChange }: QuestionProps<'text'>) => {
    const inputId = useId();
    return (
        <FormControl fullWidth>
            <StyledPrompt htmlFor={inputId} required={question.required}>
                {question.prompt}
            </StyledPrompt>
            <TextField
                id={inputId}
                value={value}
                onChange={(event) => onChange(event.target.value)}
                placeholder='Your answer here'
                multiline
                minRows={2}
                size='small'
                variant='outlined'
                fullWidth
            />
        </FormControl>
    );
};

const SurveyQuestion = ({
    question,
    value,
    onChange,
}: QuestionProps<SurveyQuestionConfig['type']>) => {
    switch (question.type) {
        case 'rating':
            return (
                <RatingQuestion
                    question={question}
                    value={value}
                    onChange={onChange}
                />
            );
        case 'single':
            return (
                <SingleChoiceQuestion
                    question={question}
                    value={value}
                    onChange={onChange}
                />
            );
        case 'text':
            return (
                <TextQuestion
                    question={question}
                    value={value}
                    onChange={onChange}
                />
            );
    }
};

type ScheduleLeave = (leave: () => void) => () => void;

const leaveAfterDelay: ScheduleLeave = (leave) => {
    const timer = setTimeout(leave, THANKS_VISIBLE_MS);
    return () => clearTimeout(timer);
};

interface UxSurveyCardProps {
    survey: SurveyConfig;
    scheduleLeave?: ScheduleLeave;
}

type CardState = 'answering' | 'thanks' | 'leaving' | 'closed';

export const UxSurveyCard = ({
    survey,
    scheduleLeave = leaveAfterDelay,
}: UxSurveyCardProps) => {
    const [state, setState] = useState<CardState>('answering');
    const [answers, setAnswers] = useState<Record<string, string>>({});

    const canSubmit = survey.questions.every(
        (question) =>
            !question.required || Boolean(answers[question.id]?.trim()),
    );

    const setAnswer = (questionId: string, value: string) =>
        setAnswers((current) => ({ ...current, [questionId]: value }));

    const onClose = () => {
        markSurveySeen(survey.surveyId);
        setState('closed');
    };

    const onSubmit = (event: SyntheticEvent) => {
        event.preventDefault();
        markSurveySeen(survey.surveyId);
        setState('thanks');
    };

    useEffect(() => {
        if (state !== 'thanks') {
            return;
        }
        return scheduleLeave(() => setState('leaving'));
    }, [state, scheduleLeave]);

    if (state === 'closed') {
        return null;
    }

    return (
        <Fade in={state !== 'leaving'} onExited={() => setState('closed')}>
            <StyledCard elevation={8} role='complementary' aria-label='Survey'>
                <StyledCloseButton
                    aria-label='Close survey'
                    size='small'
                    onClick={onClose}
                >
                    <CloseIcon fontSize='small' />
                </StyledCloseButton>
                {state !== 'answering' ? (
                    <StyledThanks>
                        <CheckCircleOutlined color='primary' fontSize='large' />
                        <Typography variant='h3' component='p'>
                            Thanks for your feedback!
                        </Typography>
                    </StyledThanks>
                ) : (
                    <>
                        <Typography variant='h3' component='h2'>
                            {survey.title}
                        </Typography>
                        {survey.intro ? (
                            <Typography
                                variant='body2'
                                color='text.secondary'
                                sx={{ mt: 1 }}
                            >
                                {survey.intro}
                            </Typography>
                        ) : null}
                        <StyledForm onSubmit={onSubmit}>
                            {survey.questions.map((question) => (
                                <SurveyQuestion
                                    key={question.id}
                                    question={question}
                                    value={answers[question.id] ?? ''}
                                    onChange={(value) =>
                                        setAnswer(question.id, value)
                                    }
                                />
                            ))}
                            <Button
                                type='submit'
                                variant='contained'
                                color='primary'
                                disabled={!canSubmit}
                            >
                                Submit
                            </Button>
                        </StyledForm>
                    </>
                )}
            </StyledCard>
        </Fade>
    );
};
