import '@testing-library/jest-dom/vitest';
import { beforeEach, expect, test, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import copy from 'copy-to-clipboard';
import { render } from 'utils/testRenderer';
import { testServerSetup } from 'utils/testServer';
import { GettingStartedBanner } from './GettingStartedBanner.tsx';

const { setToastData } = vi.hoisted(() => ({ setToastData: vi.fn() }));
vi.mock('copy-to-clipboard', () => ({ default: vi.fn() }));
vi.mock('hooks/useToast', () => ({ default: () => ({ setToastData }) }));
testServerSetup();

beforeEach(() => {
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
    expect(prompt).toContain('keep tokens out of chat');
    expect(prompt).toContain('verify a successful SDK fetch');
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
