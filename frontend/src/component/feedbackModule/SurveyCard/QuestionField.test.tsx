import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import { fireEvent, screen } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import type { SurveyAnswer, SurveyQuestion } from '../survey.ts';
import { QuestionField } from './QuestionField.tsx';

type RatingQuestion = Extract<SurveyQuestion, { type: 'rating' }>;
type FreeTextQuestion = Extract<SurveyQuestion, { type: 'free-text' }>;

const ratingQuestion = (
    overrides: Partial<RatingQuestion> = {},
): RatingQuestion => ({
    id: 'rate',
    type: 'rating',
    prompt: 'Rate this page',
    required: false,
    scale: 5,
    ...overrides,
});

const freeTextQuestion = (
    overrides: Partial<FreeTextQuestion> = {},
): FreeTextQuestion => ({
    id: 'why',
    type: 'free-text',
    prompt: 'Anything else?',
    required: false,
    ...overrides,
});

const AnsweredQuestion = ({ question }: { question: SurveyQuestion }) => {
    const [answer, setAnswer] = useState<SurveyAnswer>();
    return (
        <QuestionField
            question={question}
            value={answer}
            onChange={setAnswer}
        />
    );
};

const renderQuestion = (question: SurveyQuestion) =>
    render(<AnsweredQuestion question={question} />);

// MUI's Rating ignores clicks at (0, 0) as keyboard-triggered, which is
// fireEvent's default
const clickStar = (name: string) =>
    fireEvent.click(screen.getByRole('radio', { name }), {
        clientX: 1,
        clientY: 1,
    });

describe('QuestionField', () => {
    it("offers as many stars as the question's scale", () => {
        renderQuestion(ratingQuestion({ scale: 3 }));

        expect(
            screen.getByRole('radio', { name: '3 Stars' }),
        ).toBeInTheDocument();
        expect(
            screen.queryByRole('radio', { name: '4 Stars' }),
        ).not.toBeInTheDocument();
    });

    it('records the picked rating', () => {
        renderQuestion(ratingQuestion());

        clickStar('2 Stars');

        expect(screen.getByRole('radio', { name: '2 Stars' })).toBeChecked();
    });

    it('clears the rating when the picked star is clicked again', () => {
        renderQuestion(ratingQuestion());
        clickStar('2 Stars');

        clickStar('2 Stars');

        expect(
            screen.queryByRole('radio', { name: /Stars?$/, checked: true }),
        ).not.toBeInTheDocument();
    });

    it('records the typed answer', () => {
        renderQuestion(freeTextQuestion());

        fireEvent.change(screen.getByLabelText('Anything else?'), {
            target: { value: 'More please' },
        });

        expect(screen.getByLabelText('Anything else?')).toHaveValue(
            'More please',
        );
    });

    it('marks a required rating as required', () => {
        renderQuestion(ratingQuestion({ required: true }));

        expect(
            screen.getByRole('radiogroup', { name: 'Rate this page' }),
        ).toBeRequired();
    });

    it('does not mark an optional rating as required', () => {
        renderQuestion(ratingQuestion());

        expect(
            screen.getByRole('radiogroup', { name: 'Rate this page' }),
        ).not.toBeRequired();
    });

    it('marks a required free-text answer as required', () => {
        renderQuestion(freeTextQuestion({ required: true }));

        expect(
            screen.getByRole('textbox', { name: 'Anything else?' }),
        ).toBeRequired();
    });

    it('does not mark an optional free-text answer as required', () => {
        renderQuestion(freeTextQuestion());

        expect(
            screen.getByRole('textbox', { name: 'Anything else?' }),
        ).not.toBeRequired();
    });
});
