import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from 'utils/testRenderer';
import { FeedbackNPSCard } from './FeedbackNPSCard.tsx';

const renderCard = ({
    open = true,
    onConfirm = vi.fn(),
    onDontShowAgain = vi.fn(),
    onClose = vi.fn(),
}: Partial<Parameters<typeof FeedbackNPSCard>[0]> = {}) =>
    render(
        <FeedbackNPSCard
            open={open}
            onConfirm={onConfirm}
            onDontShowAgain={onDontShowAgain}
            onClose={onClose}
        />,
    );

describe('FeedbackNPSCard', () => {
    it('confirms when the user agrees to give feedback', async () => {
        const onConfirm = vi.fn();
        renderCard({ onConfirm });

        await userEvent.click(
            screen.getByRole('button', { name: 'Yes, no problem' }),
        );

        expect(onConfirm).toHaveBeenCalledOnce();
    });

    it('apologizes for the disruption after "Not now"', async () => {
        renderCard();

        await userEvent.click(screen.getByRole('button', { name: 'Not now' }));

        expect(
            screen.getByText(
                'Alright, apologies for the disruption. Have a nice day!',
            ),
        ).toBeInTheDocument();
    });

    it('stops showing when the user opts out after "Not now"', async () => {
        const onDontShowAgain = vi.fn();
        renderCard({ onDontShowAgain });
        await userEvent.click(screen.getByRole('button', { name: 'Not now' }));

        await userEvent.click(
            screen.getByRole('button', { name: "Don't show again" }),
        );

        expect(onDontShowAgain).toHaveBeenCalledOnce();
    });

    it('closes from the close button', async () => {
        const onClose = vi.fn();
        renderCard({ onClose });

        await userEvent.click(
            screen.getByRole('button', { name: 'Close feedback' }),
        );

        expect(onClose).toHaveBeenCalledOnce();
    });

    it('stays hidden until opened', () => {
        renderCard({ open: false });

        expect(screen.queryByRole('complementary')).not.toBeInTheDocument();
    });
});
