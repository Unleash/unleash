import { Button, styled, Typography } from '@mui/material';
import Add from '@mui/icons-material/Add';
import { MAX_QUESTIONS } from '../../survey.ts';
import {
    newQuestion,
    type QuestionDraft,
    type QuestionErrors,
} from '../surveyDraft.ts';
import { QuestionCard } from './QuestionCard/QuestionCard.tsx';

const StyledQuestionList = styled('ol')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
    margin: 0,
    padding: 0,
    listStyle: 'none',
}));

const StyledFooter = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(2),
    marginTop: theme.spacing(2),
}));

interface SurveyQuestionsProps {
    questions: QuestionDraft[];
    errors: QuestionErrors[];
    onChange: (questions: QuestionDraft[]) => void;
}

export const SurveyQuestions = ({
    questions,
    errors,
    onChange,
}: SurveyQuestionsProps) => {
    const isFull = questions.length >= MAX_QUESTIONS;

    return (
        <section aria-label='Questions'>
            <Typography variant='h3' component='h2' sx={{ mb: 2 }}>
                Questions
            </Typography>
            <StyledQuestionList>
                {questions.map((question, index) => (
                    <QuestionCard
                        key={question.key}
                        number={index + 1}
                        question={question}
                        errors={errors[index]}
                        onChange={(changed) =>
                            onChange(questions.with(index, changed))
                        }
                        onRemove={
                            questions.length > 1
                                ? () => onChange(questions.toSpliced(index, 1))
                                : undefined
                        }
                    />
                ))}
            </StyledQuestionList>
            <StyledFooter>
                <Button
                    startIcon={<Add />}
                    onClick={() =>
                        onChange([...questions, newQuestion(questions)])
                    }
                    disabled={isFull}
                >
                    Add question
                </Button>
                {isFull ? (
                    <Typography variant='body2' color='text.secondary'>
                        {`A survey can have up to ${MAX_QUESTIONS} questions.`}
                    </Typography>
                ) : null}
            </StyledFooter>
        </section>
    );
};
