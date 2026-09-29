import type { ComponentProps } from 'react';
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

const renderPage = (props: ComponentProps<typeof RemoteMcpAdmin> = {}) =>
    render(
        <>
            <ToastRenderer />
            <RemoteMcpAdmin {...props} />
        </>,
        { permissions: [{ permission: 'ADMIN' }] },
    );

const serverSwitchName = 'Enable Remote MCP Server for this instance';
const feedbackSwitchName =
    'Send feedback from the Remote MCP Server to Unleash';

const findServerSwitch = () =>
    screen.findByRole('switch', { name: serverSwitchName });
const getServerSwitch = () =>
    screen.getByRole('switch', { name: serverSwitchName });
const getFeedbackSwitch = () =>
    screen.getByRole('switch', { name: feedbackSwitchName });
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

        expect(await findServerSwitch()).toBeChecked();
    });

    test('changing only the feedback toggle marks the page dirty without saving', async () => {
        const { requests } = setupApi({ enabled: true });

        renderPage({ feedbackOptInAvailable: true });

        expect(await findServerSwitch()).toBeChecked();
        expect(getFeedbackSwitch()).toBeEnabled();
        expect(getSaveButton()).toBeDisabled();

        await userEvent.click(getFeedbackSwitch());

        expect(getFeedbackSwitch()).toBeChecked();
        expect(getSaveButton()).toBeEnabled();
        expect(getCancelButton()).toBeEnabled();
        expect(requests).toEqual([]);
    });

    test('a changed toggle is not saved until Save is clicked', async () => {
        const { requests } = setupApi({ enabled: false });

        renderPage({ feedbackOptInAvailable: true });

        await findServerSwitch();
        expect(getFeedbackSwitch()).toBeDisabled();
        expect(getSaveButton()).toBeDisabled();
        expect(getCancelButton()).toBeDisabled();

        await userEvent.click(getServerSwitch());

        expect(getServerSwitch()).toBeChecked();
        expect(getFeedbackSwitch()).toBeEnabled();
        expect(getSaveButton()).toBeEnabled();
        expect(getCancelButton()).toBeEnabled();
        expect(requests).toEqual([]);
    });

    test('saving persists the new value', async () => {
        const { requests } = setupApi({ enabled: false });

        renderPage({ feedbackOptInAvailable: true });

        await findServerSwitch();
        await userEvent.click(getServerSwitch());
        await userEvent.click(getFeedbackSwitch());
        testServerRoute(server, '/api/admin/remote-mcp/settings', {
            enabled: true,
        });

        await userEvent.click(getSaveButton());

        expect(
            await screen.findByText(
                'Remote MCP server has been successfully enabled',
            ),
        ).toBeInTheDocument();
        expect(requests).toEqual([{ enabled: true }]);
        expect(getServerSwitch()).toBeChecked();
        expect(getFeedbackSwitch()).toBeChecked();
        expect(getSaveButton()).toBeDisabled();
        expect(getCancelButton()).toBeDisabled();
    });

    test('cancel resets both toggles to the saved values', async () => {
        setupApi({ enabled: false });

        renderPage({ feedbackOptInAvailable: true });

        await findServerSwitch();
        await userEvent.click(getServerSwitch());
        await userEvent.click(getFeedbackSwitch());

        await userEvent.click(getCancelButton());

        expect(getServerSwitch()).not.toBeChecked();
        expect(getFeedbackSwitch()).not.toBeChecked();
        expect(getSaveButton()).toBeDisabled();
    });

    test('shows error toast when save fails', async () => {
        setupApi({ enabled: true, postStatus: 500 });

        renderPage({ feedbackOptInAvailable: true });

        await findServerSwitch();
        await userEvent.click(getFeedbackSwitch());

        await userEvent.click(getSaveButton());

        expect(
            await screen.findByText('Action could not be performed'),
        ).toBeInTheDocument();
        expect(getFeedbackSwitch()).toBeChecked();
        expect(getSaveButton()).toBeEnabled();
    });
});
