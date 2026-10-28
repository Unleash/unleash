import { describe, expect, it, vi } from 'vitest';
import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from 'utils/testRenderer';
import type { SurveyDefinition } from '../survey.ts';
import { SurveyCard } from './SurveyCard.tsx';

const survey: SurveyDefinition = {
    title: 'Quick feedback',
    description: 'Two quick questions.',
    questions: [
        {
            id: 'rate',
            type: 'rating',
            prompt: 'Rate this page',
            required: true,
            scale: 5,
        },
        {
            id: 'why',
            type: 'free-text',
            prompt: 'Anything else?',
            required: false,
        },
    ],
};

const renderCard = ({
    survey: shownSurvey = survey,
    onSubmit = vi.fn(),
    onDismiss = vi.fn(),
    scheduleLeave = () => () => {},
}: Partial<Parameters<typeof SurveyCard>[0]> = {}) =>
    render(
        <SurveyCard
            survey={shownSurvey}
            onSubmit={onSubmit}
            onDismiss={onDismiss}
            scheduleLeave={scheduleLeave}
        />,
    );

const multiChoiceSurvey: SurveyDefinition = {
    ...survey,
    questions: [
        {
            id: 'role',
            type: 'multi-choice',
            prompt: 'What is your role?',
            required: true,
            options: ['Developer', 'PM', 'Other'],
        },
    ],
};

const startSurvey = () =>
    userEvent.click(screen.getByRole('button', { name: 'Share feedback' }));

const answerRatingAndContinue = async (stars = 4) => {
    fireEvent.click(screen.getByRole('radio', { name: `${stars} Stars` }));
    await userEvent.click(screen.getByRole('button', { name: 'Next' }));
};

describe('SurveyCard', () => {
    it('opens on an intro step without taking focus from the page', () => {
        renderCard();

        expect(screen.getByText('Quick feedback')).toBeInTheDocument();
        expect(screen.getByText('Two quick questions.')).toBeInTheDocument();
        expect(screen.queryByText('Rate this page')).not.toBeInTheDocument();
        expect(screen.getByRole('progressbar')).toHaveAttribute(
            'aria-valuetext',
            'Step 1 of 3',
        );
        expect(
            screen.queryByRole('button', { name: 'Back' }),
        ).not.toBeInTheDocument();
        expect(document.body).toHaveFocus();
    });

    it('moves from the intro to the first question, taking focus with it', async () => {
        renderCard();

        await startSurvey();

        expect(screen.queryByText('Quick feedback')).not.toBeInTheDocument();
        expect(screen.getByRole('progressbar')).toHaveAttribute(
            'aria-valuetext',
            'Step 2 of 3',
        );
        expect(document.activeElement).toContainElement(
            screen.getByRole('radiogroup', { name: 'Rate this page' }),
        );
    });

    it('disables Next until a required question is answered', async () => {
        renderCard();
        await startSurvey();
        const next = screen.getByRole('button', { name: 'Next' });

        next.focus();
        await userEvent.keyboard('{Enter}');
        expect(next).toHaveAttribute('aria-disabled', 'true');
        expect(next).toHaveAccessibleDescription(
            'Answer this question to continue.',
        );
        expect(screen.getByText('Rate this page')).toBeInTheDocument();

        fireEvent.click(screen.getByRole('radio', { name: '4 Stars' }));
        expect(next).not.toHaveAttribute('aria-disabled');
        expect(next).not.toHaveAccessibleDescription();
    });

    it('ends on Submit instead of Next', async () => {
        renderCard();
        await startSurvey();

        await answerRatingAndContinue();

        expect(
            screen.getByRole('textbox', { name: 'Anything else?' }),
        ).toBeInTheDocument();
        expect(
            screen.queryByRole('button', { name: 'Next' }),
        ).not.toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: 'Submit' }),
        ).toBeInTheDocument();
    });

    it('goes back to the previous question keeping its answer', async () => {
        renderCard();
        await startSurvey();

        await answerRatingAndContinue(3);
        await userEvent.click(screen.getByRole('button', { name: 'Back' }));

        expect(screen.getByRole('radio', { name: '3 Stars' })).toBeChecked();
    });

    it('goes back from the first question to the intro', async () => {
        renderCard();
        await startSurvey();

        await userEvent.click(screen.getByRole('button', { name: 'Back' }));

        expect(screen.getByText('Quick feedback')).toBeInTheDocument();
    });

    it('submits trimmed answers and shows the thanks state', async () => {
        const onSubmit = vi.fn();
        renderCard({ onSubmit });
        await startSurvey();

        await answerRatingAndContinue();
        await userEvent.type(
            screen.getByRole('textbox', { name: 'Anything else?' }),
            '  More please ',
        );
        await userEvent.click(screen.getByRole('button', { name: 'Submit' }));

        expect(onSubmit).toHaveBeenCalledWith({ rate: 4, why: 'More please' });
        expect(screen.getByText('Thanks for your feedback!')).toHaveFocus();
    });

    it('drops blank free-text answers', async () => {
        const onSubmit = vi.fn();
        renderCard({ onSubmit });
        await startSurvey();

        await answerRatingAndContinue(2);
        await userEvent.type(
            screen.getByRole('textbox', { name: 'Anything else?' }),
            '   ',
        );
        await userEvent.click(screen.getByRole('button', { name: 'Submit' }));

        expect(onSubmit).toHaveBeenCalledWith({ rate: 2 });
    });

    it('dismisses after the thanks state has left', async () => {
        const onDismiss = vi.fn();
        let leave = () => {};
        renderCard({
            onDismiss,
            scheduleLeave: (callback) => {
                leave = callback;
                return () => {};
            },
        });
        await startSurvey();

        await answerRatingAndContinue();
        await userEvent.click(screen.getByRole('button', { name: 'Submit' }));
        expect(onDismiss).not.toHaveBeenCalled();

        act(() => leave());
        await waitFor(() => expect(onDismiss).toHaveBeenCalledOnce());
    });

    it('keeps the thanks message up for its full time when the page re-renders', async () => {
        let scheduled = 0;
        const scheduleLeave = () => {
            scheduled++;
            return () => {};
        };
        const card = () => (
            <SurveyCard
                survey={survey}
                onSubmit={vi.fn()}
                onDismiss={vi.fn()}
                scheduleLeave={scheduleLeave}
            />
        );
        const { rerender } = render(card());
        await startSurvey();

        await answerRatingAndContinue();
        await userEvent.click(screen.getByRole('button', { name: 'Submit' }));
        rerender(card());

        expect(scheduled).toBe(1);
    });

    it('dismisses when the card is closed', async () => {
        const onDismiss = vi.fn();
        renderCard({ onDismiss });

        await userEvent.click(
            screen.getByRole('button', { name: 'Close survey' }),
        );

        expect(onDismiss).toHaveBeenCalledOnce();
    });

    it('dismisses when the card is closed on the thanks message', async () => {
        const onDismiss = vi.fn();
        renderCard({ onDismiss });
        await startSurvey();
        await answerRatingAndContinue();
        await userEvent.click(screen.getByRole('button', { name: 'Submit' }));

        await userEvent.click(
            screen.getByRole('button', { name: 'Close survey' }),
        );

        expect(onDismiss).toHaveBeenCalledOnce();
    });

    it('submits the picked options in the order they are offered', async () => {
        const onSubmit = vi.fn();
        renderCard({ survey: multiChoiceSurvey, onSubmit });
        await startSurvey();

        await userEvent.click(screen.getByRole('checkbox', { name: 'Other' }));
        await userEvent.click(
            screen.getByRole('checkbox', { name: 'Developer' }),
        );
        await userEvent.click(screen.getByRole('button', { name: 'Submit' }));

        expect(onSubmit).toHaveBeenCalledWith({
            role: ['Developer', 'Other'],
        });
    });

    it('holds back Submit again when every picked option is unpicked', async () => {
        renderCard({ survey: multiChoiceSurvey });
        await startSurvey();

        await userEvent.click(screen.getByRole('checkbox', { name: 'PM' }));
        await userEvent.click(screen.getByRole('checkbox', { name: 'PM' }));

        expect(screen.getByRole('button', { name: 'Submit' })).toHaveAttribute(
            'aria-disabled',
            'true',
        );
    });
});
