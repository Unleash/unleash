import { screen } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import { OutdatedSdksSchema } from 'openapi';
import { OutdatedSdksBanner } from './OutdatedSdksBanner';

const server = testServerSetup();

const setupApi = (outdatedSdks: OutdatedSdksSchema) => {
    testServerRoute(server, 'api/admin/metrics/sdks/outdated', outdatedSdks);
    testServerRoute(server, '/api/admin/ui-config', {
        flags: {
            sdkReporting: true,
        },
    });
};

test('Show outdated SDKs and apps using them', async () => {
    setupApi({
        sdks: [
            {
                sdkVersion: 'unleash-node-client:3.2.1',
                applications: ['application1', 'application2'],
            },
        ],
    });
    render(<OutdatedSdksBanner />);

    const link = await screen.findByText('Please update those versions');

    link.click();

    await screen.findByText('unleash-node-client:3.2.1');
    await screen.findByText('application1');
    await screen.findByText('application2');
});
