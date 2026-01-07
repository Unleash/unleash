import { render } from 'utils/testRenderer';
import { ConnectSdkDialog } from './ConnectSdkDialog.tsx';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import { resizeScreen } from 'utils/resizeScreen';

const server = testServerSetup();

const setupApi = () => {
    testServerRoute(server, '/api/admin/projects/default/api-tokens', {
        tokens: [
            {
                environment: 'production',
                type: 'client',
                secret: 'default:development.5c4150866d',
            },
        ],
    });

    testServerRoute(server, '/api/admin/ui-config', {
        versionInfo: {
            current: { oss: 'irrelevant', enterprise: 'some value' },
        },
    });
};

test('Onboarding for SDK', async () => {
    setupApi();
    // on smaller screens we don't show concepts definitions
    resizeScreen(2000);

    render(
        <ConnectSdkDialog
            project='default'
            onClose={() => {}}
            open={true}
            environments={['development', 'production']}
            feature='featureA'
            onFinish={() => {}}
        />,
    );

    screen.getByText('1/3 - Choose SDK');
    screen.getByText('Select SDK');
    screen.getByText('SDKs and Unleash');

    const node = screen.getAllByText('Select')[0];

    fireEvent.click(node);

    screen.getByText('2/3 - Generate API Key');
    screen.getByText('API Key');
    screen.getByText('Flags live in projects');
    screen.getByText('development');
    await screen.findByText('Generate API Key');

    const envWithoutKey = screen.getByText('development');
    fireEvent.click(envWithoutKey);

    const envWithKey = screen.getByText('production');
    fireEvent.click(envWithKey);
    await screen.findByText('The API key secret');
    await screen.findByText('5c4150866d');

    const next = screen.getByText('Next');

    await waitFor(() => {
        expect(next).toBeEnabled();
    });

    fireEvent.click(next);

    await screen.findByText('npm install unleash-client');
    await screen.findByText('Connection status');
});
