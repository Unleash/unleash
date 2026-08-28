import { test } from 'vitest';
import { FeatureSetupBanner } from './FeatureSetupBanner.tsx';
import { render } from 'utils/testRenderer';
import { screen } from '@testing-library/react';

const renderBanner = (project, feature) =>
    render(
        <FeatureSetupBanner
            project={project}
            feature={{ ...feature, id: 'banner-feature' }}
            onComplete={() => {}}
        />,
    );

test('shows the Connect SDK banner when the project is not yet connected', async () => {
    renderBanner(
        { onboardingStatus: { status: 'onboarding-started' } },
        { lifecycle: { stage: 'initial' } },
    );

    await screen.findByText(
        'You must connect an SDK to the project before you can implement this flag in your code.',
    );
});

test('shows the Implement flag banner when onboarded and lifecycle is initial', async () => {
    renderBanner(
        { onboardingStatus: { status: 'onboarded' } },
        { lifecycle: { stage: 'initial' } },
    );

    await screen.findByText('Implement your flag');
    await screen.findByText('Wrap your code');
});

test('shows the Implement banner when the flag has no lifecycle yet', async () => {
    renderBanner({ onboardingStatus: { status: 'onboarded' } }, {});

    await screen.findByText('Implement your flag');
});

test('shows the Add roll out strategy banner when receiving metrics with no strategies', async () => {
    renderBanner(
        { onboardingStatus: { status: 'onboarded' } },
        {
            lifecycle: { stage: 'live' },
            environments: [{ strategies: [] }, { strategies: [] }],
        },
    );

    await screen.findByText('Next: Add roll out strategy');
    await screen.findByText('View documentation');
});
