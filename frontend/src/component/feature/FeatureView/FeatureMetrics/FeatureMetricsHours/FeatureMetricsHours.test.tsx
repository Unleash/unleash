import { screen, waitFor } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import { FeatureMetricsHours } from './FeatureMetricsHours.tsx';
import userEvent from '@testing-library/user-event';

const server = testServerSetup();

test('Display extended daily metrics', async () => {
    testServerRoute(server, '/api/admin/ui-config', {
        versionInfo: {
            current: { oss: 'irrelevant', enterprise: 'some value' },
        },
        flags: {
            extendedUsageMetrics: true,
        },
    });
    let recordedHoursBack: number | null = null;
    render(
        <FeatureMetricsHours
            hoursBack={48}
            setHoursBack={(hoursBack) => {
                recordedHoursBack = hoursBack;
            }}
        />,
    );

    const intialSelectedValue = await screen.findByText('Last 48 hours');

    userEvent.click(intialSelectedValue);

    const newSelectedValue = await screen.findByText('Last 7 days');

    userEvent.click(newSelectedValue);

    await waitFor(() => {
        expect(recordedHoursBack).toBe(7 * 24);
    });
});

test('Normalize invalid hours back to default value', async () => {
    const invalidHoursBack = 100000;
    let recordedHoursBack: number | null = null;
    render(
        <FeatureMetricsHours
            hoursBack={invalidHoursBack}
            setHoursBack={(hoursBack) => {
                recordedHoursBack = hoursBack;
            }}
        />,
    );

    await screen.findByText('Last 48 hours');

    await waitFor(() => {
        expect(recordedHoursBack).toBe(48);
    });
});
