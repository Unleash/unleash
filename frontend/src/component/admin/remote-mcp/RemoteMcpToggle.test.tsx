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
    test('renders initial toggle state from settings', async () => {
        setupApi({ enabled: false });

        render(<RemoteMcpToggle />);

        expect(await screen.findByText('Disabled')).toBeInTheDocument();
        expect(screen.getByRole('switch')).not.toBeChecked();
    });

    test('toggling updates the switch without calling the API, save/cancel become active', async () => {
        const { requests } = setupApi({ enabled: false });

        render(<RemoteMcpToggle />);

        await screen.findByText('Disabled');
        expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
        expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();

        await userEvent.click(screen.getByRole('switch'));

        expect(screen.getByRole('switch')).toBeChecked();
        expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled();
        expect(screen.getByRole('button', { name: 'Cancel' })).toBeEnabled();
        expect(requests).toEqual([]);
    });

    test('save sends correct POST and shows success toast', async () => {
        const { requests } = setupApi({ enabled: false });

        render(
            <>
                <ToastRenderer />
                <RemoteMcpToggle />
            </>,
        );

        await screen.findByText('Disabled');
        await userEvent.click(screen.getByRole('switch'));
        await userEvent.click(screen.getByRole('button', { name: 'Save' }));

        expect(requests).toEqual([{ enabled: true }]);
        expect(
            await screen.findByText(
                'Remote MCP server has been successfully enabled',
            ),
        ).toBeInTheDocument();
    });

    test('cancel resets the toggle to the server value', async () => {
        setupApi({ enabled: false });

        render(<RemoteMcpToggle />);

        await screen.findByText('Disabled');
        await userEvent.click(screen.getByRole('switch'));
        expect(screen.getByRole('switch')).toBeChecked();

        await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
        expect(screen.getByRole('switch')).not.toBeChecked();
    });

    test('shows error toast when save fails', async () => {
        setupApi({ enabled: false, postStatus: 500 });

        render(
            <>
                <ToastRenderer />
                <RemoteMcpToggle />
            </>,
        );

        await screen.findByText('Disabled');
        await userEvent.click(screen.getByRole('switch'));
        await userEvent.click(screen.getByRole('button', { name: 'Save' }));

        expect(
            await screen.findByText('Action could not be performed'),
        ).toBeInTheDocument();
    });
});
