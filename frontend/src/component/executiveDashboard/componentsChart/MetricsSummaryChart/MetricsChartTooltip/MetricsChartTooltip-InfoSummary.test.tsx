import { render, screen } from '@testing-library/react';
import { InfoSummary } from './MetricsChartTooltip';

test('Renders apps, flags, and environments, even when their data is `N/A`', () => {
    render(
        <InfoSummary
            data={[
                { key: 'Flags', value: 'N/A' },
                { key: 'Environments', value: 'N/A' },
                { key: 'Apps', value: 'N/A' },
            ]}
        />,
    );

    screen.getByText('Environments');
    screen.getByText('Apps');
    screen.getByText('Flags');
});
