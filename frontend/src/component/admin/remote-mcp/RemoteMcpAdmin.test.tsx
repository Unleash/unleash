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
    feedbackOptIn,
    feedbackOptInAvailable = true,
    postStatus = 204,
}: {
    enabled: boolean;
    feedbackOptIn?: boolean;
    feedbackOptInAvailable?: boolean;
    postStatus?: number;
}) => {
    testServerRoute(server, '/api/admin/ui-config', {
        environment: 'Enterprise',
        versionInfo: { current: { enterprise: 'version' } },
        unleashUrl: 'https://unleash.example.com',
        flags: { remoteMcpFeedback: feedbackOptInAvailable },
    });
    testServerRoute(server, '/api/admin/remote-mcp/settings', {
        enabled,
        feedbackOptIn,
    });
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

    test('shows both toggles as enabled when the server has them enabled', async () => {
        setupApi({ enabled: true, feedbackOptIn: true });

        renderPage();

        expect(await findServerSwitch()).toBeChecked();
        expect(getFeedbackSwitch()).toBeChecked();
    });

    test('changing only the feedback toggle marks the page dirty without saving', async () => {
        const { requests } = setupApi({ enabled: true });

        renderPage();

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

        renderPage();

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

        renderPage();

        await findServerSwitch();
        await userEvent.click(getServerSwitch());
        await userEvent.click(getFeedbackSwitch());
        testServerRoute(server, '/api/admin/remote-mcp/settings', {
            enabled: true,
            feedbackOptIn: true,
        });

        await userEvent.click(getSaveButton());

        expect(
            await screen.findByText(
                'Remote MCP server has been successfully enabled',
            ),
        ).toBeInTheDocument();
        expect(requests).toEqual([{ enabled: true, feedbackOptIn: true }]);
        expect(getServerSwitch()).toBeChecked();
        expect(getFeedbackSwitch()).toBeChecked();
        expect(getSaveButton()).toBeDisabled();
        expect(getCancelButton()).toBeDisabled();
    });

    test('saving without the feedback feature sends only the server toggle', async () => {
        const { requests } = setupApi({
            enabled: false,
            feedbackOptInAvailable: false,
        });

        renderPage();

        await findServerSwitch();
        expect(
            screen.queryByRole('switch', { name: feedbackSwitchName }),
        ).not.toBeInTheDocument();

        await userEvent.click(getServerSwitch());
        await userEvent.click(getSaveButton());

        expect(
            await screen.findByText(
                'Remote MCP server has been successfully enabled',
            ),
        ).toBeInTheDocument();
        expect(requests).toEqual([{ enabled: true }]);
    });

    test('cancel resets both toggles to the saved values', async () => {
        setupApi({ enabled: true, feedbackOptIn: true });

        renderPage();

        await findServerSwitch();
        await userEvent.click(getFeedbackSwitch());
        await userEvent.click(getServerSwitch());

        await userEvent.click(getCancelButton());

        expect(getServerSwitch()).toBeChecked();
        expect(getFeedbackSwitch()).toBeChecked();
        expect(getSaveButton()).toBeDisabled();
    });

    test('shows error toast when save fails', async () => {
        setupApi({ enabled: true, postStatus: 500 });

        renderPage();

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
