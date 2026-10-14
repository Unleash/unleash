import { type ElementType, useId } from 'react';
import {
    FormControl,
    FormLabel,
    Rating,
    styled,
    TextField,
} from '@mui/material';
import type { SurveyAnswer, SurveyQuestion } from '../survey.ts';

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

interface QuestionProps<Type extends SurveyQuestion['type']> {
    question: Extract<SurveyQuestion, { type: Type }>;
    value: SurveyAnswer | undefined;
    onChange: (value: SurveyAnswer | undefined) => void;
}

const RatingQuestion = ({
    question,
    value,
    onChange,
}: QuestionProps<'rating'>) => {
    const name = useId();
    const promptId = useId();
    return (
        <FormControl>
            <StyledPrompt
                id={promptId}
                component='span'
                required={question.required}
            >
                {question.prompt}
            </StyledPrompt>
            <StyledRating
                role='radiogroup'
                aria-labelledby={promptId}
                aria-required={question.required}
                name={name}
                max={question.scale}
                value={typeof value === 'number' ? value : null}
                onChange={(_, rating) => onChange(rating ?? undefined)}
            />
        </FormControl>
    );
};

const FreeTextQuestion = ({
    question,
    value,
    onChange,
}: QuestionProps<'free-text'>) => {
    const inputId = useId();
    return (
        <FormControl fullWidth>
            <StyledPrompt htmlFor={inputId} required={question.required}>
                {question.prompt}
            </StyledPrompt>
            <TextField
                id={inputId}
                value={typeof value === 'string' ? value : ''}
                onChange={(event) => onChange(event.target.value)}
                placeholder='Your answer here'
                multiline
                minRows={2}
                size='small'
                variant='outlined'
                fullWidth
                // Not `required`: the survey card checks answers itself, so the
                // browser's own validation must not step in on submit.
                slotProps={{
                    htmlInput: { 'aria-required': question.required },
                }}
            />
        </FormControl>
    );
};

export const QuestionField = ({
    question,
    value,
    onChange,
}: QuestionProps<SurveyQuestion['type']>) => {
    switch (question.type) {
        case 'rating':
            return (
                <RatingQuestion
                    question={question}
                    value={value}
                    onChange={onChange}
                />
            );
        case 'free-text':
            return (
                <FreeTextQuestion
                    question={question}
                    value={value}
                    onChange={onChange}
                />
            );
    }
};
