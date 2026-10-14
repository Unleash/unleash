import { describe, expect, it, vi } from 'vitest';
import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from 'utils/testRenderer';
import type { Survey } from '../survey.ts';
import { SurveyCard } from './SurveyCard.tsx';

const survey: Survey = {
    flagName: 'survey-onboarding',
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
    onSubmit = vi.fn(),
    onDismiss = vi.fn(),
    scheduleLeave = () => () => {},
}: Partial<Parameters<typeof SurveyCard>[0]> = {}) =>
    render(
        <SurveyCard
            survey={survey}
            onSubmit={onSubmit}
            onDismiss={onDismiss}
            scheduleLeave={scheduleLeave}
        />,
    );

describe('SurveyCard', () => {
    it('renders the survey and its questions', () => {
        renderCard();

        expect(screen.getByText('Quick feedback')).toBeInTheDocument();
        expect(screen.getByText('Two quick questions.')).toBeInTheDocument();
        expect(screen.getByText('Rate this page')).toBeInTheDocument();
        expect(screen.getByLabelText('Anything else?')).toBeInTheDocument();
    });

    it('holds back Submit, explaining why, until required questions are answered', async () => {
        renderCard();
        const submit = screen.getByRole('button', { name: 'Submit' });

        await userEvent.type(screen.getByLabelText('Anything else?'), 'Hi');
        submit.focus();
        await userEvent.keyboard('{Enter}');
        expect(submit).toHaveAttribute('aria-disabled', 'true');
        expect(submit).toHaveAccessibleDescription(
            'Answer the questions marked * to submit.',
        );
        expect(
            screen.queryByText('Thanks for your feedback!'),
        ).not.toBeInTheDocument();

        fireEvent.click(screen.getByRole('radio', { name: '4 Stars' }));
        expect(submit).not.toHaveAttribute('aria-disabled');
        expect(submit).not.toHaveAccessibleDescription();
    });

    it('submits trimmed answers and shows the thanks state', async () => {
        const onSubmit = vi.fn();
        renderCard({ onSubmit });

        fireEvent.click(screen.getByRole('radio', { name: '4 Stars' }));
        await userEvent.type(
            screen.getByLabelText('Anything else?'),
            '  More please ',
        );
        await userEvent.click(screen.getByRole('button', { name: 'Submit' }));

        expect(onSubmit).toHaveBeenCalledWith({ rate: 4, why: 'More please' });
        expect(screen.getByText('Thanks for your feedback!')).toHaveFocus();
    });

    it('drops blank free-text answers', async () => {
        const onSubmit = vi.fn();
        renderCard({ onSubmit });

        fireEvent.click(screen.getByRole('radio', { name: '2 Stars' }));
        await userEvent.type(screen.getByLabelText('Anything else?'), '   ');
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

        fireEvent.click(screen.getByRole('radio', { name: '4 Stars' }));
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

        fireEvent.click(screen.getByRole('radio', { name: '4 Stars' }));
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
});
