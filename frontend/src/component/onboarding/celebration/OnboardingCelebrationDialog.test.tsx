import { expect, test, vi } from 'vitest';
import { render } from 'utils/testRenderer';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import { OnboardingCelebrationDialog } from './OnboardingCelebrationDialog.tsx';

vi.mock('react-confetti', () => ({
    default: () => <div data-testid='confetti' />,
}));

const server = testServerSetup();

const setupApi = () => {
    testServerRoute(server, '/api/admin/search/features', {
        features: [
            {
                name: 'my-first-flag',
                environments: [
                    {
                        name: 'development',
                        type: 'development',
                        enabled: true,
                    },
                ],
            },
        ],
        total: 1,
    });
};

test('shows celebration with confetti and next steps when open', async () => {
    setupApi();
    render(
        <OnboardingCelebrationDialog
            projectId='default'
            open
            onClose={() => {}}
            onConnectSdk={() => {}}
        />,
    );

    await screen.findByText(/Your flag is live/);
    expect(screen.getByTestId('confetti')).toBeInTheDocument();

    const rolloutLink = await screen.findByRole('link', {
        name: /Add a gradual rollout/,
    });
    expect(rolloutLink).toHaveAttribute(
        'href',
        expect.stringContaining(
            '/projects/default/features/my-first-flag/strategies/create',
        ),
    );

    const inviteLink = screen.getByRole('link', {
        name: /Invite a teammate/,
    });
    expect(inviteLink).toHaveAttribute('href', '/admin/invite-link');
});

test('connect SDK card opens the SDK dialog and closes the celebration', async () => {
    setupApi();
    const onClose = vi.fn();
    const onConnectSdk = vi.fn();
    render(
        <OnboardingCelebrationDialog
            projectId='default'
            open
            onClose={onClose}
            onConnectSdk={onConnectSdk}
        />,
    );

    await screen.findByText(/Your flag is live/);
    await userEvent.click(
        screen.getByRole('button', { name: /Connect your SDK/ }),
    );

    expect(onClose).toHaveBeenCalled();
    expect(onConnectSdk).toHaveBeenCalled();
});

test('renders nothing visible when closed', () => {
    setupApi();
    render(
        <OnboardingCelebrationDialog
            projectId='default'
            open={false}
            onClose={() => {}}
            onConnectSdk={() => {}}
        />,
    );

    expect(screen.queryByText(/Your flag is live/)).not.toBeInTheDocument();
    expect(screen.queryByTestId('confetti')).not.toBeInTheDocument();
});
