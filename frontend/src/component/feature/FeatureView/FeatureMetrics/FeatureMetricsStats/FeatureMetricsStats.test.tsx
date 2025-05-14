import { render } from 'utils/testRenderer';
import { FeatureMetricsStats } from './FeatureMetricsStats.tsx';
import { screen } from '@testing-library/react';

test('render hourly metrics stats', async () => {
    render(<FeatureMetricsStats totalYes={100} totalNo={100} hoursBack={48} />);

    expect(screen.getByText('200')).toBeInTheDocument();
    expect(screen.getByText('50%')).toBeInTheDocument();
    expect(
        screen.getByText(
            'Total requests for the feature in the environment in the last 48 hours (local time).',
        ),
    ).toBeInTheDocument();
});

test('render daily metrics stats', async () => {
    render(
        <FeatureMetricsStats totalYes={100} totalNo={100} hoursBack={7 * 24} />,
    );

    expect(
        screen.getByText(
            'Total requests for the feature in the environment in the last 7 days (UTC).',
        ),
    ).toBeInTheDocument();
});
