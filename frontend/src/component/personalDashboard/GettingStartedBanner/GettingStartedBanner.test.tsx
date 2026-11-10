import '@testing-library/jest-dom/vitest';
import { beforeEach, expect, test, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import copy from 'copy-to-clipboard';
import { render, settleProviders } from 'utils/testRenderer';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import { GettingStartedBanner } from './GettingStartedBanner.tsx';

const { setToastData } = vi.hoisted(() => ({ setToastData: vi.fn() }));
vi.mock('copy-to-clipboard', () => ({ default: vi.fn() }));
vi.mock('hooks/useToast', () => ({ default: () => ({ setToastData }) }));
const server = testServerSetup();
const instructions =
    'Help me connect a feature flag. Read https://github.com/Unleash/unleash-mcp and https://docs.getunleash.io/. Keep tokens out of chat.';
const enabledVariant = {
    name: 'setup',
    enabled: true,
    payload: { type: 'string', value: instructions },
};

beforeEach(() => {
    testServerRoute(server, '/api/admin/ui-config', {
        flags: { dashboardOnboardingAI: enabledVariant },
    });
    vi.clearAllMocks();
    vi.mocked(copy).mockReturnValue(true);
});

test('copies a self-contained prompt for this instance and links to manual flag creation', async () => {
    render(
        <GettingStartedBanner
            instanceUrl='https://example.com/unleash'
            projectId='my project'
            promptContext={{ remoteMcpEnabled: true, version: '8.3.0' }}
        />,
    );
    await userEvent.click(
        await screen.findByRole('button', { name: 'Copy setup prompt' }),
    );

    const prompt = vi.mocked(copy).mock.calls[0][0];
    expect(prompt).toContain(
        'My Unleash instance is: https://example.com/unleash',
    );
    expect(prompt).not.toContain('<INSTANCE_URL>');
    expect(prompt).toContain('https://github.com/Unleash/unleash-mcp');
    expect(prompt).toContain('https://docs.getunleash.io/');
    expect(prompt).toContain('Suggested project: "my project"');
    expect(prompt).toContain('Remote MCP: enabled.');
    expect(prompt).toContain('https://example.com/unleash/api/admin/mcp');
    expect(prompt).toContain('Unleash version: 8.3.0');
    expect(prompt.startsWith(instructions)).toBe(true);
    expect(prompt.indexOf('Context from Unleash')).toBeGreaterThan(
        prompt.indexOf(instructions),
    );
    expect(setToastData).toHaveBeenCalledWith({
        type: 'success',
        text: 'Setup prompt copied. Paste it into your coding agent.',
    });
    expect(
        screen.getByRole('link', { name: 'Create flag manually' }),
    ).toHaveAttribute('href', '/projects/my%20project?create=true');
});

test('reports a failed copy without claiming the prompt was copied', async () => {
    vi.mocked(copy).mockReturnValue(false);
    render(
        <GettingStartedBanner
            instanceUrl='https://example.com'
            projectId='default'
        />,
    );
    await userEvent.click(
        await screen.findByRole('button', { name: 'Copy setup prompt' }),
    );
    expect(setToastData).toHaveBeenCalledWith({
        type: 'error',
        text: 'Could not copy the setup prompt. Please try again.',
    });
    expect(setToastData).not.toHaveBeenCalledWith(
        expect.objectContaining({ type: 'success' }),
    );
});

test.each([
    ['unavailable', undefined],
    ['disabled', { ...enabledVariant, enabled: false }],
    ['off', false],
])('offers only manual setup when AI setup is %s', async (_name, variant) => {
    testServerRoute(server, '/api/admin/ui-config', {
        flags: { dashboardOnboardingAI: variant },
    });
    render(
        <GettingStartedBanner
            instanceUrl='https://example.com'
            projectId='default'
        />,
    );
    await settleProviders();
    expect(
        screen.queryByRole('button', { name: 'Copy setup prompt' }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText('Get started with AI')).not.toBeInTheDocument();
    expect(screen.queryByText(/coding agent/)).not.toBeInTheDocument();
    expect(
        screen.getByRole('link', { name: 'Create your first flag' }),
    ).toHaveAttribute('href', '/projects/default?create=true');
});

test.each([
    ['no variant', true],
    ['missing payload', { name: 'setup', enabled: true }],
    [
        'empty payload',
        { ...enabledVariant, payload: { type: 'string', value: '   ' } },
    ],
    [
        'JSON payload',
        { ...enabledVariant, payload: { type: 'json', value: '{invalid' } },
    ],
    [
        'non-string value',
        { ...enabledVariant, payload: { type: 'string', value: 42 } },
    ],
])('copies the built-in prompt when AI setup has %s', async (_name, variant) => {
    testServerRoute(server, '/api/admin/ui-config', {
        flags: { dashboardOnboardingAI: variant },
    });
    render(
        <GettingStartedBanner
            instanceUrl='https://example.com/unleash'
            projectId='default'
        />,
    );
    await userEvent.click(
        await screen.findByRole('button', { name: 'Copy setup prompt' }),
    );
    const prompt = vi.mocked(copy).mock.calls[0][0];
    expect(prompt).toContain('Help me connect my first Unleash feature flag');
    expect(prompt).toContain('https://github.com/Unleash/unleash-mcp');
    expect(prompt).toContain('keep tokens out of chat');
    expect(prompt).toContain('verify a successful SDK fetch');
    expect(prompt).toContain(
        'My Unleash instance is: https://example.com/unleash',
    );
    expect(prompt).not.toContain(instructions);
    expect(
        screen.getByRole('link', { name: 'Create flag manually' }),
    ).toHaveAttribute('href', '/projects/default?create=true');
});

test('offers manual setup while configuration is loading and when it fails', async () => {
    testServerRoute(server, '/api/admin/ui-config', {}, 'get', 500);
    render(
        <GettingStartedBanner
            instanceUrl='https://example.com'
            projectId='default'
        />,
    );
    expect(
        screen.queryByRole('button', { name: 'Copy setup prompt' }),
    ).not.toBeInTheDocument();
    expect(
        screen.getByRole('link', { name: 'Create your first flag' }),
    ).toBeInTheDocument();
    await settleProviders();
    expect(screen.queryByText('Get started with AI')).not.toBeInTheDocument();
});
