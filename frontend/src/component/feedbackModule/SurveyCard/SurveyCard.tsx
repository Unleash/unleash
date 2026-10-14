import {
    type SyntheticEvent,
    useEffect,
    useEffectEvent,
    useId,
    useRef,
    useState,
} from 'react';
import {
    Button,
    Fade,
    IconButton,
    Paper,
    styled,
    Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleOutlined from '@mui/icons-material/CheckCircleOutlined';
import type { Survey, SurveyAnswer, SurveyAnswers } from '../survey.ts';
import { QuestionField } from './QuestionField.tsx';

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

const StyledThanks = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: theme.spacing(1.5),
    padding: theme.spacing(3, 2),
    textAlign: 'center',
}));

const isAnswered = (answer: SurveyAnswer | undefined): boolean => {
    if (typeof answer === 'string') {
        return answer.trim() !== '';
    }
    return answer !== undefined;
};

const cleanAnswers = (answers: SurveyAnswers): SurveyAnswers =>
    Object.fromEntries(
        Object.entries(answers)
            .filter(([, answer]) => isAnswered(answer))
            .map(([id, answer]) => [
                id,
                typeof answer === 'string' ? answer.trim() : answer,
            ]),
    );

type ScheduleLeave = (leave: () => void) => () => void;

const leaveAfterDelay: ScheduleLeave = (leave) => {
    const timer = setTimeout(leave, THANKS_VISIBLE_MS);
    return () => clearTimeout(timer);
};

interface ThanksMessageProps {
    scheduleLeave: ScheduleLeave;
    onLeave: () => void;
}

const ThanksMessage = ({ scheduleLeave, onLeave }: ThanksMessageProps) => {
    const messageRef = useRef<HTMLParagraphElement>(null);
    const leave = useEffectEvent(onLeave);

    useEffect(() => {
        // Focused so screen readers announce it.
        messageRef.current?.focus();
        return scheduleLeave(leave);
    }, [scheduleLeave]);

    return (
        <StyledThanks>
            <CheckCircleOutlined color='primary' fontSize='large' />
            <Typography
                ref={messageRef}
                tabIndex={-1}
                variant='h3'
                component='p'
            >
                Thanks for your feedback!
            </Typography>
        </StyledThanks>
    );
};

interface SurveyFormProps {
    survey: Survey;
    onSubmit: (answers: SurveyAnswers) => void;
}

const SurveyForm = ({ survey, onSubmit }: SurveyFormProps) => {
    const [answers, setAnswers] = useState<SurveyAnswers>({});
    const submitHintId = useId();

    const canSubmit = survey.questions.every(
        (question) => !question.required || isAnswered(answers[question.id]),
    );

    const setAnswer = (questionId: string, value: SurveyAnswer | undefined) =>
        setAnswers((current) => {
            const { [questionId]: _, ...rest } = current;
            return value === undefined
                ? rest
                : { ...rest, [questionId]: value };
        });

    const handleSubmit = (event: SyntheticEvent) => {
        event.preventDefault();
        if (!canSubmit) {
            return;
        }
        onSubmit(cleanAnswers(answers));
    };

    return (
        <>
            <Typography variant='h3' component='h2'>
                {survey.title}
            </Typography>
            {survey.description ? (
                <Typography
                    variant='body2'
                    color='text.secondary'
                    sx={{ mt: 1 }}
                >
                    {survey.description}
                </Typography>
            ) : null}
            <StyledForm onSubmit={handleSubmit}>
                {survey.questions.map((question) => (
                    <QuestionField
                        key={question.id}
                        question={question}
                        value={answers[question.id]}
                        onChange={(value) => setAnswer(question.id, value)}
                    />
                ))}
                {canSubmit ? null : (
                    <Typography
                        id={submitHintId}
                        variant='body2'
                        color='text.secondary'
                    >
                        Answer the questions marked * to submit.
                    </Typography>
                )}
                {/* with native `disabled` the submit button is not reachable by keyboard */}
                <Button
                    type='submit'
                    variant='contained'
                    color='primary'
                    aria-disabled={canSubmit ? undefined : true}
                    aria-describedby={canSubmit ? undefined : submitHintId}
                    className={canSubmit ? undefined : 'Mui-disabled'}
                >
                    Submit
                </Button>
            </StyledForm>
        </>
    );
};

interface SurveyCardProps {
    survey: Survey;
    onSubmit: (answers: SurveyAnswers) => void;
    onDismiss: () => void;
    scheduleLeave?: ScheduleLeave;
}

type CardState = 'answering' | 'thanks' | 'leaving';

export const SurveyCard = ({
    survey,
    onSubmit,
    onDismiss,
    scheduleLeave = leaveAfterDelay,
}: SurveyCardProps) => {
    const [state, setState] = useState<CardState>('answering');

    const handleSubmit = (answers: SurveyAnswers) => {
        onSubmit(answers);
        setState('thanks');
    };

    return (
        <Fade in={state !== 'leaving'} onExited={onDismiss}>
            <StyledCard elevation={8} role='complementary' aria-label='Survey'>
                <StyledCloseButton
                    aria-label='Close survey'
                    size='small'
                    onClick={onDismiss}
                >
                    <CloseIcon fontSize='small' />
                </StyledCloseButton>
                {state === 'answering' ? (
                    <SurveyForm survey={survey} onSubmit={handleSubmit} />
                ) : (
                    <ThanksMessage
                        scheduleLeave={scheduleLeave}
                        onLeave={() => setState('leaving')}
                    />
                )}
            </StyledCard>
        </Fade>
    );
};
