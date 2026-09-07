import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
    fireEvent,
    screen,
    waitForElementToBeRemoved,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from 'utils/testRenderer';
import { UxSurveyCard } from './UxSurveyCard.tsx';
import type { SurveyConfig } from './surveys.ts';

const survey: SurveyConfig = {
    flagName: 'uxtweak-survey-projects-abc1',
    surveyId: 'sv_1',
    page: '/projects',
    title: 'Quick feedback',
    intro: 'One question.',
    questions: [
        { id: 'q1', type: 'rating', prompt: 'Rate this page', required: true },
    ],
    submitBase: 'https://uxtweak.example.com',
};

describe('UxSurveyCard', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('fades the thanks view away once the leave schedule fires', async () => {
        let leave = () => {};
        render(
            <UxSurveyCard
                survey={survey}
                onSubmitted={vi.fn()}
                scheduleLeave={(trigger) => {
                    leave = trigger;
                    return () => {};
                }}
            />,
        );

        await userEvent.click(screen.getByRole('radio', { name: '4 Stars' }));
        await userEvent.click(screen.getByRole('button', { name: 'Submit' }));
        expect(
            screen.getByText('Thanks for your feedback!'),
        ).toBeInTheDocument();

        leave();
        await waitForElementToBeRemoved(() =>
            screen.queryByText('Thanks for your feedback!'),
        );
    });

    it('hands submitted answers up with ratings as numbers and blanks omitted', async () => {
        const onSubmitted = vi.fn();
        render(
            <UxSurveyCard
                survey={{
                    ...survey,
                    questions: [
                        ...survey.questions,
                        {
                            id: 'q2',
                            type: 'text',
                            prompt: 'Anything else?',
                            required: false,
                        },
                        {
                            id: 'q3',
                            type: 'text',
                            prompt: 'And more?',
                            required: false,
                        },
                    ],
                }}
                onSubmitted={onSubmitted}
            />,
        );

        fireEvent.click(screen.getByRole('radio', { name: '4 Stars' }));
        await userEvent.type(
            screen.getByLabelText('Anything else?'),
            '  More flags please  ',
        );
        await userEvent.click(screen.getByRole('button', { name: 'Submit' }));

        expect(onSubmitted).toHaveBeenCalledWith({
            q1: 4,
            q2: 'More flags please',
        });
    });
});
