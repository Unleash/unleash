import { screen } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import { ApplicationIssues } from './ApplicationIssues';
import { ApplicationOverviewIssuesSchema } from 'openapi';

test('Display all application issues', async () => {
    const issues: ApplicationOverviewIssuesSchema[] = [
        {
            type: 'missingFeatures',
            items: ['my-app'],
        },
        {
            type: 'missingStrategies',
            items: ['defaultStrategy', 'mainStrategy'],
        },
        {
            type: 'outdatedSdks',
            items: ['unleash-client-php:1.13.0'],
        },
    ];
    render(<ApplicationIssues issues={issues} />);

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
});
