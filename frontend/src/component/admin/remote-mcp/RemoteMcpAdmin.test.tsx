import { describe, expect, test } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from 'utils/testRenderer';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import ToastRenderer from 'component/common/ToastRenderer/ToastRenderer';
import { RemoteMcpAdmin } from './RemoteMcpAdmin.tsx';

const server = testServerSetup();

const setupApi = ({
    enabled,
    postStatus = 204,
}: {
    enabled: boolean;
    postStatus?: number;
}) => {
    testServerRoute(server, '/api/admin/ui-config', {
        environment: 'Enterprise',
        versionInfo: { current: { enterprise: 'version' } },
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

const renderPage = () =>
    render(
        <>
            <ToastRenderer />
            <RemoteMcpAdmin />
        </>,
        { permissions: [{ permission: 'ADMIN' }] },
    );

const findSwitch = () => screen.findByRole('switch');
const getSwitch = () => screen.getByRole('switch');
const getSaveButton = () => screen.getByRole('button', { name: 'Save' });
const getCancelButton = () => screen.getByRole('button', { name: 'Cancel' });

describe('RemoteMcpAdmin', () => {
    test('shows the page with the MCP endpoint on the Enterprise plan', async () => {
        setupApi({ enabled: false });

        renderPage();

        expect(
            await screen.findByText('Remote MCP Server'),
        ).toBeInTheDocument();
        expect(
            screen.getByText('https://unleash.example.com/api/admin/mcp'),
        ).toBeInTheDocument();
    });

    test('shows an upgrade prompt instead of the page on a non-enterprise plan', async () => {
        testServerRoute(server, '/api/admin/ui-config', {
            environment: 'Pro',
            versionInfo: { current: { enterprise: 'version' } },
        });

        renderPage();

        expect(
            await screen.findByText('Enterprise feature'),
        ).toBeInTheDocument();
        expect(screen.queryByText('Remote MCP Server')).not.toBeInTheDocument();
    });

    test('shows the toggle as enabled when the server has it enabled', async () => {
        setupApi({ enabled: true });

        renderPage();

        expect(await findSwitch()).toBeChecked();
    });

    test('a changed toggle is not saved until Save is clicked', async () => {
        const { requests } = setupApi({ enabled: false });

        renderPage();

        await findSwitch();
        expect(getSaveButton()).toBeDisabled();
        expect(getCancelButton()).toBeDisabled();

        await userEvent.click(getSwitch());

        expect(getSwitch()).toBeChecked();
        expect(getSaveButton()).toBeEnabled();
        expect(getCancelButton()).toBeEnabled();
        expect(requests).toEqual([]);
    });

    test('saving persists the new value', async () => {
        const { requests } = setupApi({ enabled: false });

        renderPage();

        await findSwitch();
        await userEvent.click(getSwitch());
        await userEvent.click(getSaveButton());

        expect(requests).toEqual([{ enabled: true }]);
        expect(
            await screen.findByText(
                'Remote MCP server has been successfully enabled',
            ),
        ).toBeInTheDocument();
    });

    test('cancel resets the toggle to the server value', async () => {
        setupApi({ enabled: false });

        renderPage();

        await findSwitch();
        await userEvent.click(getSwitch());
        expect(getSwitch()).toBeChecked();

        await userEvent.click(getCancelButton());
        expect(getSwitch()).not.toBeChecked();
    });

    test('shows error toast when save fails', async () => {
        setupApi({ enabled: false, postStatus: 500 });

        renderPage();

        await findSwitch();
        await userEvent.click(getSwitch());
        await userEvent.click(getSaveButton());

        expect(
            await screen.findByText('Action could not be performed'),
        ).toBeInTheDocument();
    });
});
