import { render } from 'utils/testRenderer';
import { ProjectList } from './ProjectList.tsx';
import { screen, waitFor } from '@testing-library/react';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import { CREATE_PROJECT } from '../../providers/AccessProvider/permissions.ts';

const server = testServerSetup();

const setupApi = () => {
    testServerRoute(server, '/api/admin/ui-config', {
        resourceLimits: { projects: 1 },
        versionInfo: {
            current: { enterprise: 'version' },
        },
    });

    testServerRoute(server, '/api/admin/projects', {
        projects: [{ name: 'existing', id: '1' }],
    });
};

test('Enabled new project button when version and permission allow for it and limit is reached', async () => {
    setupApi();
    render(<ProjectList />, {
        permissions: [{ permission: CREATE_PROJECT }],
    });

    const button = await screen.findByText('New project');
    expect(button).toHaveAttribute('aria-disabled', 'true');

    await waitFor(async () => {
        const button = await screen.findByText('New project');
        expect(button).not.toHaveAttribute('aria-disabled', 'true');
    });
});
