import { screen } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import { ApplicationIssues } from './ApplicationIssues.tsx';
import type { ApplicationOverviewSchema } from 'openapi';

test('Display all application issues', async () => {
    const application: ApplicationOverviewSchema = {
        projects: ['default'],
        featureCount: 0,
        environments: [
            {
                issues: {
                    missingFeatures: ['my-app'],
                    outdatedSdks: ['unleash-client-php:1.13.0'],
                },
                sdks: [],
                backendSdks: [],
                frontendSdks: [],
                instanceCount: 0,
                lastSeen: new Date().toISOString(),
                name: 'development',
            },
        ],
        issues: {
            missingStrategies: ['defaultStrategy', 'mainStrategy'],
        },
    };
    render(<ApplicationIssues application={application} />);

    await screen.findByText('my-app');
    await screen.findByText('mainStrategy');
    await screen.findByText(
        `We detected 1 feature flag defined in the SDK that does not exist in Unleash`,
    );
    await screen.findByText(
        `We detected 2 strategy types defined in the SDK that do not exist in Unleash`,
    );
    await screen.findByText(`We detected the following outdated SDKs`);
    await screen.findByText(`unleash-client-php:1.13.0`);
    await screen.findByText(`We detected 4 issues in this application`);
});

test('Each SDK version should be displayed once', async () => {
    const application: ApplicationOverviewSchema = {
        projects: ['default'],
        featureCount: 0,
        environments: [
            {
                issues: {
                    missingFeatures: [],
                    outdatedSdks: ['unleash-client-php:1.13.0'],
                },
                sdks: [],
                frontendSdks: [],
                backendSdks: [],
                instanceCount: 0,
                lastSeen: new Date().toISOString(),
                name: 'development',
            },
            {
                issues: {
                    missingFeatures: [],
                    outdatedSdks: ['unleash-client-php:1.13.0'],
                },
                sdks: [],
                frontendSdks: [],
                backendSdks: [],
                instanceCount: 0,
                lastSeen: new Date().toISOString(),
                name: 'production',
            },
        ],
        issues: {
            missingStrategies: [],
        },
    };
    render(<ApplicationIssues application={application} />);

    await screen.findByText(`We detected 1 issue in this application`);
});
