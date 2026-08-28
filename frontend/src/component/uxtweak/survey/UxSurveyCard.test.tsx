import { beforeEach, describe, expect, it } from 'vitest';
import { screen, waitForElementToBeRemoved } from '@testing-library/react';
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
});
