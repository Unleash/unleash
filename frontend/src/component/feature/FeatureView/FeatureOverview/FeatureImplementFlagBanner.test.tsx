import { test } from 'vitest';
import { FeatureImplementFlagBanner } from './FeatureImplementFlagBanner.tsx';
import { render } from 'utils/testRenderer';
import { screen } from '@testing-library/react';
import { testServerRoute, testServerSetup } from 'utils/testServer';

const server = testServerSetup();

const PROJECT_ID = 'banner-project';
const FEATURE_ID = 'banner-feature';

const setupReadyForImplement = () => {
    testServerRoute(server, `/api/admin/projects/${PROJECT_ID}/overview`, {
        onboardingStatus: { status: 'onboarded' },
    });

    testServerRoute(
        server,
        `/api/admin/projects/${PROJECT_ID}/features/${FEATURE_ID}`,
        {
            lifecycle: {
                stage: 'initial',
            },
        },
    );
};

test('renders the banner when project is onboarded and flag is in initial lifecycle', async () => {
    setupReadyForImplement();

    render(
        <FeatureImplementFlagBanner
            projectId={PROJECT_ID}
            featureId={FEATURE_ID}
        />,
    );

    await screen.findByText('Implement your flag');
    await screen.findByText('Wrap your code');
});
