import { vi, test, expect } from 'vitest';
import { render } from 'utils/testRenderer';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FeatureConnectSdkBanner } from './FeatureConnectSdkBanner.tsx';

const mockUseProjectOverview = vi.fn();

vi.mock('hooks/api/getters/useProjectOverview/useProjectOverview', () => ({
    default: () => mockUseProjectOverview(),
}));

vi.mock('hooks/usePlausibleTracker', () => ({
    usePlausibleTracker: () => ({ trackEvent: vi.fn() }),
}));

vi.mock('component/onboarding/dialog/ConnectSdkDialog', () => ({
    ConnectSdkDialog: ({ open }: { open: boolean }) =>
        open ? <div role='dialog' /> : null,
}));

const PROJECT_ID = 'test-project';
const FEATURE_ID = 'test-feature';

const makeProjectOverview = (status: string) => ({
    project: { onboardingStatus: { status }, environments: [] },
    loading: false,
    error: undefined,
    refetch: vi.fn(),
});

const renderBanner = () =>
    render(
        <FeatureConnectSdkBanner
            projectId={PROJECT_ID}
            featureId={FEATURE_ID}
        />,
        {
            permissions: [
                { permission: 'UPDATE_PROJECT', project: PROJECT_ID },
            ],
        },
    );

test('hides the banner when the SDK is already connected', () => {
    mockUseProjectOverview.mockReturnValue(
        makeProjectOverview('sdk-connected'),
    );
    renderBanner();
    expect(
        screen.queryByRole('button', { name: 'Connect SDK' }),
    ).not.toBeInTheDocument();
});

test('keeps the dialog mounted when status changes to sdk-connected while dialog is open', async () => {
    mockUseProjectOverview.mockReturnValue(
        makeProjectOverview('first-flag-created'),
    );
    const { rerender } = renderBanner();

    await userEvent.click(screen.getByRole('button', { name: 'Connect SDK' }));

    mockUseProjectOverview.mockReturnValue(
        makeProjectOverview('sdk-connected'),
    );
    rerender(
        <FeatureConnectSdkBanner
            projectId={PROJECT_ID}
            featureId={FEATURE_ID}
        />,
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
});
