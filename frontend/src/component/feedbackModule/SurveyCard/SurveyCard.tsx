import {
    type SyntheticEvent,
    useCallback,
    useEffect,
    useEffectEvent,
    useId,
    useRef,
    useState,
} from 'react';
import { Button, Fade, styled, Typography } from '@mui/material';
import CheckCircleOutlined from '@mui/icons-material/CheckCircleOutlined';
import { ScreenReaderOnly } from 'component/common/ScreenReaderOnly/ScreenReaderOnly';
import type {
    SurveyAnswer,
    SurveyAnswers,
    SurveyDefinition,
    SurveyQuestion,
} from '../survey.ts';
import { QuestionField } from './QuestionField.tsx';
import {
    StyledSurveyCard,
    StyledSurveyCardActions,
    StyledSurveyCardHeader,
    SurveyCardCloseButton,
} from './SurveyCardLayout.tsx';

const THANKS_VISIBLE_MS = 3000;

const StyledProgress = styled('div')(({ theme }) => ({
    display: 'flex',
    flex: 1,
    gap: theme.spacing(0.75),
}));

const StyledProgressStep = styled('div', {
    shouldForwardProp: (prop) => prop !== 'reached',
})<{ reached: boolean }>(({ theme, reached }) => ({
    flex: 1,
    height: theme.spacing(0.75),
    borderRadius: theme.shape.borderRadiusLarge,
    backgroundColor: reached
        ? theme.palette.primary.main
        : theme.palette.primary.container,
}));

const StyledForm = styled('form')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2.5),
}));

const StyledStep = styled('div')(({ theme }) => ({
    // Fits a free-text or rating question with a one-line prompt, so the card
    // keeps its height between steps.
    minHeight: theme.spacing(14),
    '&:focus': {
        outline: 'none',
    },
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

interface SurveyProgressProps {
    step: number;
    total: number;
}

const SurveyProgress = ({ step, total }: SurveyProgressProps) => (
    <StyledProgress
        role='progressbar'
        aria-label='Survey progress'
        aria-valuemin={1}
        aria-valuemax={total}
        aria-valuenow={step + 1}
        aria-valuetext={`Step ${step + 1} of ${total}`}
    >
        {Array.from({ length: total }, (_, index) => (
            <StyledProgressStep key={index} reached={index <= step} />
        ))}
    </StyledProgress>
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

type FocusStep = (element: HTMLDivElement | null) => void;

interface IntroStepProps {
    survey: SurveyDefinition;
    focusStep: FocusStep;
}

const IntroStep = ({ survey, focusStep }: IntroStepProps) => (
    <>
        <StyledStep ref={focusStep} tabIndex={-1}>
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
        </StyledStep>
        <Button type='submit' variant='contained' color='primary'>
            Share feedback
        </Button>
    </>
);

interface QuestionStepProps {
    question: SurveyQuestion;
    value: SurveyAnswer | undefined;
    onChange: (value: SurveyAnswer | undefined) => void;
    onBack: () => void;
    canContinue: boolean;
    isLast: boolean;
    focusStep: FocusStep;
}

const QuestionStep = ({
    question,
    value,
    onChange,
    onBack,
    canContinue,
    isLast,
    focusStep,
}: QuestionStepProps) => {
    const continueHintId = useId();

    return (
        <>
            <StyledStep ref={focusStep} tabIndex={-1}>
                <QuestionField
                    question={question}
                    value={value}
                    onChange={onChange}
                />
            </StyledStep>
            <StyledSurveyCardActions>
                <Button variant='outlined' onClick={onBack}>
                    Back
                </Button>
                {canContinue ? null : (
                    <ScreenReaderOnly id={continueHintId}>
                        Answer this question to continue.
                    </ScreenReaderOnly>
                )}
                {/* with native `disabled` the button is not reachable by keyboard */}
                <Button
                    type='submit'
                    variant='contained'
                    color='primary'
                    sx={{ flex: 1 }}
                    aria-disabled={canContinue ? undefined : true}
                    aria-describedby={canContinue ? undefined : continueHintId}
                    className={canContinue ? undefined : 'Mui-disabled'}
                >
                    {isLast ? 'Submit' : 'Next'}
                </Button>
            </StyledSurveyCardActions>
        </>
    );
};

interface SurveyFormProps {
    survey: SurveyDefinition;
    onSubmit: (answers: SurveyAnswers) => void;
    onDismiss: () => void;
}

const SurveyForm = ({ survey, onSubmit, onDismiss }: SurveyFormProps) => {
    const [answers, setAnswers] = useState<SurveyAnswers>({});
    const [step, setStep] = useState(0);
    const focusStepOnMount = useRef(false);

    const totalSteps = survey.questions.length + 1;
    const isLast = step === totalSteps - 1;
    const question: SurveyQuestion | undefined = survey.questions[step - 1];
    const canContinue = !question?.required || isAnswered(answers[question.id]);

    // focusStepOnMount is set to true only when you change the step, not when the survey shows up.
    // We don't want to steal the focus.
    const focusStep: FocusStep = useCallback((element) => {
        if (element && focusStepOnMount.current) {
            element.focus();
        }
    }, []);

    const goToStep = (nextStep: number) => {
        focusStepOnMount.current = true;
        setStep(nextStep);
    };

    const setAnswer = (questionId: string, value: SurveyAnswer | undefined) =>
        setAnswers((current) => {
            const { [questionId]: _, ...rest } = current;
            return value === undefined
                ? rest
                : { ...rest, [questionId]: value };
        });

    const handleSubmit = (event: SyntheticEvent) => {
        event.preventDefault();
        if (!canContinue) {
            return;
        }
        if (isLast) {
            onSubmit(cleanAnswers(answers));
        } else {
            goToStep(step + 1);
        }
    };

    return (
        <>
            <StyledSurveyCardHeader>
                <SurveyProgress step={step} total={totalSteps} />
                <SurveyCardCloseButton onClick={onDismiss} />
            </StyledSurveyCardHeader>
            <StyledForm onSubmit={handleSubmit}>
                {question === undefined ? (
                    <IntroStep survey={survey} focusStep={focusStep} />
                ) : (
                    <QuestionStep
                        key={question.id}
                        question={question}
                        value={answers[question.id]}
                        onChange={(value) => setAnswer(question.id, value)}
                        onBack={() => goToStep(step - 1)}
                        canContinue={canContinue}
                        isLast={isLast}
                        focusStep={focusStep}
                    />
                )}
            </StyledForm>
        </>
    );
};

interface SurveyCardProps {
    survey: SurveyDefinition;
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
            <StyledSurveyCard
                elevation={8}
                role='complementary'
                aria-label='Survey'
            >
                {state === 'answering' ? (
                    <SurveyForm
                        survey={survey}
                        onSubmit={handleSubmit}
                        onDismiss={onDismiss}
                    />
                ) : (
                    <>
                        <StyledSurveyCardHeader>
                            <SurveyCardCloseButton onClick={onDismiss} />
                        </StyledSurveyCardHeader>
                        <ThanksMessage
                            scheduleLeave={scheduleLeave}
                            onLeave={() => setState('leaving')}
                        />
                    </>
                )}
            </StyledSurveyCard>
        </Fade>
    );
};
