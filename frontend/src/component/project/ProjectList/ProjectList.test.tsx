import { render } from 'utils/testRenderer';
import { ProjectListNew } from './ProjectList';
import { screen, waitFor } from '@testing-library/react';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import { CREATE_PROJECT } from '../../providers/AccessProvider/permissions';

const server = testServerSetup();

const setupApi = () => {
    testServerRoute(server, '/api/admin/ui-config', {
        flags: {
            resourceLimits: true,
        },
        resourceLimits: {
            projects: 1,
        },
        versionInfo: {
            current: { enterprise: 'version' },
        },
    });

    testServerRoute(server, '/api/admin/projects', {
        projects: [],
    });
};

test('Enabled new project button when limits, version and permission allow for it', async () => {
    setupApi();
    render(<ProjectListNew />, {
        permissions: [{ permission: CREATE_PROJECT }],
    });

    const button = await screen.findByText('New project');
    expect(button).toBeDisabled();

    await waitFor(async () => {
        const button = await screen.findByText('New project');
        expect(button).not.toBeDisabled();
    });
});
