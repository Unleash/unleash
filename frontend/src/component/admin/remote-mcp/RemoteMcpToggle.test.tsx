import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from 'utils/testRenderer';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import ToastRenderer from 'component/common/ToastRenderer/ToastRenderer';
import { RemoteMcpToggle } from './RemoteMcpToggle.tsx';
import { describe, test, expect } from 'vitest';
const server = testServerSetup();

const setupApi = ({
    enabled,
    postStatus = 204,
}: {
    enabled: boolean;
    postStatus?: number;
}) => {
    testServerRoute(server, '/api/admin/ui-config', {
        flags: { remoteMcpServer: true },
        unleashUrl: 'https://unleash.example.com',
    });
    testServerRoute(server, '/api/admin/remote-mcp/settings', { enabled });
    return testServerRoute(
        server,
        '/api/admin/remote-mcp/settings',
        postStatus === 204 ? {} : { message: 'Internal server error' },
        'post',
        postStatus,
    );
};

describe('RemoteMcpToggle', () => {
    test('renders as disabled when settings return enabled: false', async () => {
        setupApi({ enabled: false });

        render(<RemoteMcpToggle />);

        expect(await screen.findByText('Disabled')).toBeInTheDocument();
        expect(screen.getByRole('switch')).not.toBeChecked();
    });

    test('renders as enabled when settings return enabled: true', async () => {
        setupApi({ enabled: true });

        render(<RemoteMcpToggle />);

        expect(await screen.findByText('Enabled')).toBeInTheDocument();
        expect(screen.getByRole('switch')).toBeChecked();
    });

    test('sends POST with enabled: true when toggling on', async () => {
        const { requests } = setupApi({ enabled: false });

        render(<RemoteMcpToggle />);

        await screen.findByText('Disabled');
        await userEvent.click(screen.getByRole('switch'));

        expect(requests).toEqual([{ enabled: true }]);
    });

    test('sends POST with enabled: false when toggling off', async () => {
        const { requests } = setupApi({ enabled: true });

        render(<RemoteMcpToggle />);

        await screen.findByText('Enabled');
        await userEvent.click(screen.getByRole('switch'));

        expect(requests).toEqual([{ enabled: false }]);
    });

    test('shows success toast after toggling on', async () => {
        setupApi({ enabled: false });

        render(
            <>
                <ToastRenderer />
                <RemoteMcpToggle />
            </>,
        );

        await screen.findByText('Disabled');
        await userEvent.click(screen.getByRole('switch'));

        expect(
            await screen.findByText(
                'Remote MCP server has been successfully enabled',
            ),
        ).toBeInTheDocument();
    });

    test('shows success toast after toggling off', async () => {
        setupApi({ enabled: true });

        render(
            <>
                <ToastRenderer />
                <RemoteMcpToggle />
            </>,
        );

        await screen.findByText('Enabled');
        await userEvent.click(screen.getByRole('switch'));

        expect(
            await screen.findByText(
                'Remote MCP server has been successfully disabled',
            ),
        ).toBeInTheDocument();
    });

    test('shows error toast when the API call fails', async () => {
        setupApi({ enabled: false, postStatus: 500 });

        render(
            <>
                <ToastRenderer />
                <RemoteMcpToggle />
            </>,
        );

        await screen.findByText('Disabled');
        await userEvent.click(screen.getByRole('switch'));

        expect(
            await screen.findByText('Action could not be performed'),
        ).toBeInTheDocument();
    });
});
