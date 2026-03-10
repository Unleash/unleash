import { vi } from 'vitest';
import { render } from 'utils/testRenderer';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TrialUpsell } from './TrialUpsell';

describe('TrialUpsell', () => {
    it('shows pricing info for admins', () => {
        render(
            <TrialUpsell
                isAdmin
                seatPrice={20}
                trialExpiry='2026-03-15T00:00:00Z'
            />,
        );

        expect(screen.getByText(/\$20/)).toBeInTheDocument();
        expect(screen.getByText(/per user billed/)).toBeInTheDocument();
        expect(screen.getByText('Pay by credit card')).toBeInTheDocument();
        expect(screen.getByText('Cancel anytime')).toBeInTheDocument();
    });

    it('shows contact-admin alert for non-admins', () => {
        render(<TrialUpsell isAdmin={false} seatPrice={20} />);

        expect(
            screen.getByText(/Contact your account admin/),
        ).toBeInTheDocument();
        expect(screen.queryByText(/per user billed/)).not.toBeInTheDocument();
    });

    it('shows the formatted trial expiry date when provided', () => {
        render(
            <TrialUpsell
                isAdmin
                seatPrice={20}
                trialExpiry='2026-03-15T00:00:00Z'
            />,
        );

        expect(screen.getByText(/on .+/)).toBeInTheDocument();
    });

    it('falls back to "soon" when no trialExpiry is provided', () => {
        render(<TrialUpsell isAdmin seatPrice={20} />);

        expect(screen.getByText(/expires soon/)).toBeInTheDocument();
    });

    it('shows expiration title and message when trial has expired', () => {
        render(<TrialUpsell isAdmin seatPrice={20} trialExpired />);

        expect(
            screen.getByRole('heading', {
                name: 'Upgrade to continue using Unleash',
            }),
        ).toBeInTheDocument();
        expect(
            screen.getByText(
                'Your free trial has expired and your account is scheduled for deletion. Upgrade to preserve your projects and feature flags.',
            ),
        ).toBeInTheDocument();
        expect(screen.queryByText(/14 day free trial/)).not.toBeInTheDocument();
    });

    it('shows trusted logos for all users', () => {
        render(<TrialUpsell isAdmin seatPrice={20} />);

        expect(
            screen.getByText('Trusted by enterprises like'),
        ).toBeInTheDocument();
    });

    it('shows upgrade button for admins when onUpgrade is provided', () => {
        render(<TrialUpsell isAdmin seatPrice={20} onUpgrade={vi.fn()} />);

        expect(
            screen.getByRole('button', { name: /upgrade now/i }),
        ).toBeInTheDocument();
    });

    it('does not show upgrade button for non-admins', () => {
        render(
            <TrialUpsell isAdmin={false} seatPrice={20} onUpgrade={vi.fn()} />,
        );

        expect(
            screen.queryByRole('button', { name: /upgrade now/i }),
        ).not.toBeInTheDocument();
    });

    it('calls onUpgrade when upgrade button is clicked', async () => {
        const onUpgrade = vi.fn();
        render(<TrialUpsell isAdmin seatPrice={20} onUpgrade={onUpgrade} />);

        await userEvent.click(
            screen.getByRole('button', { name: /upgrade now/i }),
        );

        expect(onUpgrade).toHaveBeenCalledTimes(1);
    });
});
