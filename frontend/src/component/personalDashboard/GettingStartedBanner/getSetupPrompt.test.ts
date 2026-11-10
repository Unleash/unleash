import { expect, test } from 'vitest';
import { PayloadType } from 'utils/variants';
import {
    ADMIN,
    CREATE_FEATURE,
    CREATE_PROJECT_API_TOKEN,
} from 'component/providers/AccessProvider/permissions';
import { getSetupPrompt } from './getSetupPrompt.ts';

test('includes project links, environment, version, and relevant project permissions', () => {
    const prompt = getSetupPrompt(
        'https://example.com/unleash/',
        'my project',
        {
            version: '8.3.0',
            isOss: false,
            environment: 'development',
            permissions: [
                { permission: CREATE_FEATURE, project: 'my project' },
                { permission: CREATE_PROJECT_API_TOKEN, project: 'my project' },
            ],
        },
    );
    expect(prompt).toContain('Suggested project: "my project"');
    expect(prompt).toContain(
        'Project: https://example.com/unleash/projects/my%20project',
    );
    expect(prompt).toContain(
        'Project API access: https://example.com/unleash/projects/my%20project/settings/api-access',
    );
    expect(prompt).toContain('Suggested environment: "development"');
    expect(prompt).toContain('Unleash version: 8.3.0');
    expect(prompt).toContain('Edition: Enterprise');
    expect(prompt).toContain('Create flags in this project: yes');
    expect(prompt).toContain('Create SDK tokens in this project: yes');
    expect(prompt).toContain('Create projects: no');
    expect(prompt).toContain('Manage remote MCP: no');
});

test('provides the enabled remote endpoint', () => {
    const prompt = getSetupPrompt('https://example.com/unleash', 'default', {
        remoteMcpEnabled: true,
    });
    expect(prompt).toContain('Remote MCP: enabled.');
    expect(prompt).toContain(
        'Remote MCP endpoint: https://example.com/unleash/api/admin/mcp',
    );
});

test('directs an administrator to the settings page when remote MCP is disabled', () => {
    const prompt = getSetupPrompt('https://example.com/unleash', 'default', {
        remoteMcpEnabled: false,
        permissions: [{ permission: ADMIN }],
    });
    expect(prompt).toContain('Remote MCP: disabled.');
    expect(prompt).toContain(
        'Remote MCP settings: https://example.com/unleash/admin/remote-mcp',
    );
    expect(prompt).toContain('Manage remote MCP: yes');
});

test('reports missing permissions without suggesting the admin settings page', () => {
    const prompt = getSetupPrompt('https://example.com', 'default', {
        remoteMcpEnabled: false,
        permissions: [
            { permission: CREATE_FEATURE, project: 'another-project' },
        ],
    });
    expect(prompt).toContain('Remote MCP: disabled.');
    expect(prompt).toContain('Manage remote MCP: no');
    expect(prompt).toContain('Create flags in this project: no');
    expect(prompt).not.toContain('Remote MCP settings:');
});

test('does not treat unavailable MCP settings or permissions as disabled or denied', () => {
    const prompt = getSetupPrompt('https://example.com', 'default');
    expect(prompt).toContain('Remote MCP: unknown.');
    expect(prompt).not.toContain('Remote MCP: disabled.');
    expect(prompt).not.toContain('Manage remote MCP: no');
    expect(prompt).not.toContain('Create flags in this project: no');
    expect(prompt).not.toContain('Unleash version:');
});

test('does not assume a user can enable a disabled server when permissions are unknown', () => {
    const prompt = getSetupPrompt('https://example.com', 'default', {
        remoteMcpEnabled: false,
    });
    expect(prompt).toContain('Remote MCP: disabled.');
    expect(prompt).not.toContain('Manage remote MCP:');
    expect(prompt).not.toContain('Remote MCP settings:');
});

test('reports remote MCP as unavailable on OSS without suggesting Enterprise settings', () => {
    const prompt = getSetupPrompt('https://example.com', 'default', {
        isOss: true,
        permissions: [{ permission: ADMIN }],
    });
    expect(prompt).toContain('Edition: OSS');
    expect(prompt).toContain('Remote MCP: unavailable on OSS.');
    expect(prompt).not.toContain('/api/admin/mcp');
    expect(prompt).not.toContain('/admin/remote-mcp');
    expect(prompt).toContain('Create projects: no');
    expect(prompt).toContain('Manage remote MCP: no');
});

test('appends instance context after the supplied instructions without rendering templates', () => {
    const instructions = 'Use {{my preferred framework}}.\nKeep this wording.';
    const prompt = getSetupPrompt(
        'https://example.com/base/',
        'default',
        undefined,
        {
            name: 'custom',
            enabled: true,
            payload: { type: PayloadType.STRING, value: `  ${instructions}\n` },
        },
    );
    expect(prompt).toBe(
        `${instructions}\n\nContext from Unleash when this prompt was copied (verify access before making changes):\nMy Unleash instance is: https://example.com/base\nSuggested project: "default"\nProject: https://example.com/base/projects/default\nProject API access: https://example.com/base/projects/default/settings/api-access\nRemote MCP: unknown.\nRemote MCP endpoint: https://example.com/base/api/admin/mcp`,
    );
});
