import { render } from 'utils/testRenderer';
import { FeatureMetricsTable } from './FeatureMetricsTable.tsx';
import { screen } from '@testing-library/react';
import { formatDateYMDHM } from '../../../../../utils/formatDate.ts';

test('render local time for hourly results', async () => {
    render(
        <FeatureMetricsTable
            metrics={[
                {
                    featureName: 'irrelevant',
                    appName: 'my-application',
                    environment: 'development',
                    yes: 20,
                    no: 10,
                    timestamp: '2024-01-12T12:00:00.000Z',
                },
            ]}
        />,
    );
    const localDate = formatDateYMDHM('2024-01-12T12:00:00.000Z', 'en-US');

    expect(screen.getByText('my-application')).toBeInTheDocument();
    expect(screen.getByText('development')).toBeInTheDocument();
    expect(screen.getByText('30')).toBeInTheDocument();
    expect(screen.getByText('20')).toBeInTheDocument();
    expect(screen.getByText(localDate)).toBeInTheDocument();
});

test('render UTC for daily results', async () => {
    render(
        <FeatureMetricsTable
            metrics={[
                {
                    featureName: 'irrelevant',
                    appName: 'my-application',
                    environment: 'development',
                    yes: 20,
                    no: 10,
                    timestamp: '2024-01-12T23:59:59.999Z',
                },
            ]}
        />,
    );
    // 23:59 is hour UTC heuristic
    const localDate = formatDateYMDHM(
        '2024-01-12T23:59:59.999Z',
        'en-US',
        'UTC',
    );

    expect(screen.getByText('my-application')).toBeInTheDocument();
    expect(screen.getByText('development')).toBeInTheDocument();
    expect(screen.getByText('30')).toBeInTheDocument();
    expect(screen.getByText('20')).toBeInTheDocument();
    expect(screen.getByText(localDate)).toBeInTheDocument();
});
