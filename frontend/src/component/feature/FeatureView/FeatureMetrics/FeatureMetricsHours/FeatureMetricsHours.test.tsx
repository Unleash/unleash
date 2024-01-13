import { screen, waitFor } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import { FeatureMetricsHours } from './FeatureMetricsHours';
import userEvent from '@testing-library/user-event';

const server = testServerSetup();

test('Display extended daily metrics', async () => {
    testServerRoute(server, '/api/admin/ui-config', {
        flags: {
            extendedUsageMetricsUI: true,
        },
        versionInfo: {
            current: { oss: 'irrelevant', enterprise: 'some value' },
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

    const newSelectedValue = await screen.findByText('Last week');

    userEvent.click(newSelectedValue);

    await waitFor(() => {
        expect(recordedHoursBack).toBe(7 * 24);
    });
});
