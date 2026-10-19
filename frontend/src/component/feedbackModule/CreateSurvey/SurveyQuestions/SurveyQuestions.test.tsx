import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from 'utils/testRenderer';
import { MAX_QUESTIONS } from '../../survey.ts';
import {
    newQuestion,
    type QuestionDraft,
    type QuestionErrors,
} from '../surveyDraft.ts';
import { SurveyQuestions } from './SurveyQuestions.tsx';

const draftQuestions = (count: number): QuestionDraft[] =>
    Array.from({ length: count }, (_, index) => ({
        ...newQuestion([]),
        id: `q${index + 1}`,
        prompt: `Prompt ${index + 1}`,
    }));

const choiceQuestion = (options: string[]): QuestionDraft => ({
    ...draftQuestions(1)[0],
    type: 'multi-choice',
    options,
});

const Editable = ({
    initial,
    errors = [],
}: {
    initial: QuestionDraft[];
    errors?: QuestionErrors[];
}) => {
    const [questions, setQuestions] = useState(initial);
    return (
        <SurveyQuestions
            questions={questions}
            errors={errors}
            onChange={setQuestions}
        />
    );
};

const questionCard = (number: number) =>
    screen.getByRole('group', { name: `Question ${number}` });

const removeButton = (number: number) =>
    within(questionCard(number)).getByRole('button', {
        name: 'Remove question',
    });

describe('SurveyQuestions', () => {
    it('adds a question with an ID no other question uses', async () => {
        render(<Editable initial={draftQuestions(1)} />);

        await userEvent.click(
            screen.getByRole('button', { name: 'Add question' }),
        );

        expect(
            within(questionCard(2)).getByRole('textbox', { name: /ID/ }),
        ).toHaveValue('question-2');
    });

    it('stops adding questions at the limit', () => {
        render(<Editable initial={draftQuestions(MAX_QUESTIONS)} />);

        expect(
            screen.getByRole('button', { name: 'Add question' }),
        ).toBeDisabled();
        expect(
            screen.getByText(
                `A survey can have up to ${MAX_QUESTIONS} questions.`,
            ),
        ).toBeInTheDocument();
    });

    it('removes the chosen question', async () => {
        render(<Editable initial={draftQuestions(2)} />);

        await userEvent.click(removeButton(1));

        expect(
            within(questionCard(1)).getByRole('textbox', {
                name: 'Question 1',
            }),
        ).toHaveValue('Prompt 2');
        expect(
            screen.queryByRole('group', { name: 'Question 2' }),
        ).not.toBeInTheDocument();
    });

    it('keeps the last question', () => {
        render(<Editable initial={draftQuestions(1)} />);

        expect(removeButton(1)).toBeDisabled();
    });

    it('asks for a scale only for rating questions', async () => {
        render(<Editable initial={draftQuestions(1)} />);
        const card = questionCard(1);
        expect(
            within(card).getByRole('combobox', { name: 'Scale' }),
        ).toBeInTheDocument();

        await userEvent.click(
            within(card).getByRole('combobox', { name: 'Type' }),
        );
        await userEvent.click(
            screen.getByRole('option', { name: 'Free text' }),
        );

        expect(
            within(card).queryByRole('combobox', { name: 'Scale' }),
        ).not.toBeInTheDocument();
    });

    it('keeps what is entered into a question', async () => {
        render(<Editable initial={draftQuestions(1)} />);
        const card = questionCard(1);
        const prompt = within(card).getByRole('textbox', {
            name: 'Question 1',
        });
        const id = within(card).getByRole('textbox', { name: /ID/ });

        await userEvent.clear(prompt);
        await userEvent.type(prompt, 'How fast was it?');
        await userEvent.clear(id);
        await userEvent.type(id, 'speed');
        await userEvent.click(within(card).getByLabelText('Required'));
        await userEvent.click(
            within(card).getByRole('combobox', { name: 'Scale' }),
        );
        await userEvent.click(screen.getByRole('option', { name: '7 stars' }));

        expect(prompt).toHaveValue('How fast was it?');
        expect(id).toHaveValue('speed');
        expect(within(card).getByLabelText('Required')).toBeChecked();
        expect(
            within(card).getByRole('combobox', { name: 'Scale' }),
        ).toHaveTextContent('7 stars');
    });

    it('asks for options only for multiple choice questions', async () => {
        render(<Editable initial={draftQuestions(1)} />);
        const card = questionCard(1);

        await userEvent.click(
            within(card).getByRole('combobox', { name: 'Type' }),
        );
        await userEvent.click(
            screen.getByRole('option', { name: 'Multiple choice' }),
        );

        expect(within(card).getByLabelText('Option 1')).toHaveValue('');
        expect(
            within(card).queryByRole('combobox', { name: 'Scale' }),
        ).not.toBeInTheDocument();
    });

    it('keeps the options entered into a multiple choice question', async () => {
        render(<Editable initial={[choiceQuestion(['Dev'])]} />);
        const card = questionCard(1);

        await userEvent.click(
            within(card).getByRole('button', { name: 'Add option' }),
        );
        await userEvent.type(within(card).getByLabelText('Option 2'), 'PM');

        expect(within(card).getByLabelText('Option 1')).toHaveValue('Dev');
        expect(within(card).getByLabelText('Option 2')).toHaveValue('PM');
    });

    it('removes the chosen option', async () => {
        render(<Editable initial={[choiceQuestion(['Dev', 'PM'])]} />);
        const card = questionCard(1);

        await userEvent.click(
            within(card).getByRole('button', { name: 'Remove option 1' }),
        );

        expect(within(card).getByLabelText('Option 1')).toHaveValue('PM');
        expect(
            within(card).queryByLabelText('Option 2'),
        ).not.toBeInTheDocument();
    });

    it('keeps the last option', () => {
        render(<Editable initial={[choiceQuestion(['Dev'])]} />);

        expect(
            within(questionCard(1)).getByRole('button', {
                name: 'Remove option 1',
            }),
        ).toBeDisabled();
    });

    it('shows the errors of each option', () => {
        render(
            <Editable
                initial={[choiceQuestion(['Dev', ''])]}
                errors={[{ options: [undefined, 'Enter an option'] }]}
            />,
        );

        expect(
            within(questionCard(1)).getByLabelText('Option 2'),
        ).toHaveAccessibleDescription('Enter an option');
    });

    it('shows the errors of each question', () => {
        render(
            <Editable
                initial={draftQuestions(2)}
                errors={[{}, { prompt: 'Enter a question', id: 'Enter an ID' }]}
            />,
        );

        expect(
            within(questionCard(2)).getByText('Enter a question'),
        ).toBeInTheDocument();
        expect(
            within(questionCard(2)).getByText('Enter an ID'),
        ).toBeInTheDocument();
        expect(
            within(questionCard(1)).queryByText('Enter a question'),
        ).not.toBeInTheDocument();
    });
});
