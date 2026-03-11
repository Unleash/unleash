import { vi } from 'vitest';
import { render } from 'utils/testRenderer';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TrialUpsellPure } from './TrialUpsell';

describe('TrialUpsell', () => {
    it('shows pricing info for admins', () => {
        render(
            <TrialUpsellPure
                isAdmin
                seatPrice={20}
                trialExpiry='2026-03-19T23:59:59.999Z'
                locale='en-US'
            />,
        );

        expect(screen.getByText(/\$20/)).toBeInTheDocument();
        expect(screen.getByText(/per user billed/)).toBeInTheDocument();
        expect(screen.getByText('Pay by credit card')).toBeInTheDocument();
        expect(screen.getByText('Cancel anytime')).toBeInTheDocument();
    });

    it('shows contact-admin alert for non-admins', () => {
        render(
            <TrialUpsellPure isAdmin={false} seatPrice={20} locale='en-US' />,
        );

        expect(
            screen.getByText(/Contact your account admin/),
        ).toBeInTheDocument();
        expect(screen.queryByText(/per user billed/)).not.toBeInTheDocument();
    });

    it('shows the formatted trial expiry date when provided', () => {
        render(
            <TrialUpsellPure
                isAdmin
                seatPrice={20}
                trialExpiry='2026-03-19T23:59:59.999Z'
                locale='en-US'
            />,
        );

        expect(
            screen.getByText(/Your trial expires on March 19/),
        ).toBeInTheDocument();
    });

    it('shows the formatted trial expiry date in user time zone', () => {
        render(
            <TrialUpsellPure
                isAdmin
                seatPrice={20}
                trialExpiry='2026-03-19T23:59:59.999Z'
                locale='en-US'
            />,
        );

        expect(
            screen.getByText(/Your trial expires on March 19/),
        ).toBeInTheDocument();
    });

    it('falls back to "soon" when no trialExpiry is provided', () => {
        render(<TrialUpsellPure isAdmin seatPrice={20} locale='en-US' />);

        expect(screen.getByText(/expires soon/)).toBeInTheDocument();
    });

    it('shows expiration title and message when trial has expired', () => {
        render(
            <TrialUpsellPure
                isAdmin
                seatPrice={20}
                trialExpired
                locale='en-US'
            />,
        );

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
        render(<TrialUpsellPure isAdmin seatPrice={20} locale='en-US' />);

        expect(
            screen.getByText('Trusted by enterprises like'),
        ).toBeInTheDocument();
    });

    it('shows upgrade button for admins when onUpgrade is provided', () => {
        render(
            <TrialUpsellPure
                isAdmin
                seatPrice={20}
                onUpgrade={vi.fn()}
                locale='en-US'
            />,
        );

        expect(
            screen.getByRole('button', { name: /upgrade now/i }),
        ).toBeInTheDocument();
    });

    it('does not show upgrade button for non-admins', () => {
        render(
            <TrialUpsellPure
                isAdmin={false}
                seatPrice={20}
                onUpgrade={vi.fn()}
                locale='en-US'
            />,
        );

        expect(
            screen.queryByRole('button', { name: /upgrade now/i }),
        ).not.toBeInTheDocument();
    });

    it('calls onUpgrade when upgrade button is clicked', async () => {
        const onUpgrade = vi.fn();
        render(
            <TrialUpsellPure
                isAdmin
                seatPrice={20}
                onUpgrade={onUpgrade}
                locale='en-US'
            />,
        );

        await userEvent.click(
            screen.getByRole('button', { name: /upgrade now/i }),
        );

        expect(onUpgrade).toHaveBeenCalledTimes(1);
    });
});
