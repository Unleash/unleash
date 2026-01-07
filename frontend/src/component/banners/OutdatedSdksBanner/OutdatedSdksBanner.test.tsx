import { screen, waitFor } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import type { OutdatedSdksSchema } from 'openapi';
import { OutdatedSdksBanner } from './OutdatedSdksBanner.tsx';

const server = testServerSetup();

const setupApi = (outdatedSdks: OutdatedSdksSchema) => {
    testServerRoute(
        server,
        '/api/admin/projects/default/sdks/outdated',
        outdatedSdks,
    );
    testServerRoute(server, '/api/admin/ui-config', {
        flags: {
            outdatedSdksBanner: true,
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
    render(<OutdatedSdksBanner project={'default'} />);

    const link = await screen.findByText('Please update those versions');

    link.click();

    await screen.findByText('Outdated SDKs');
    await screen.findByText('unleash-node-client:3.2.1');
    const application = await screen.findByText('application1');
    await screen.findByText('application2');

    application.click(); // clicking on an application link should close the modal

    await waitFor(() => {
        expect(screen.queryByText('Outdated SDKs')).not.toBeInTheDocument();
    });
});
