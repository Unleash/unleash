import { render } from 'utils/testRenderer';
import { screen, waitFor } from '@testing-library/react';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import { CreateProjectDialog } from './CreateProjectDialog.tsx';
import { CREATE_PROJECT } from '../../../../providers/AccessProvider/permissions.ts';

const server = testServerSetup();

const setupApi = (existingProjectsCount: number) => {
    testServerRoute(server, '/api/admin/ui-config', {
        resourceLimits: { projects: 1 },
        versionInfo: {
            current: { enterprise: 'version' },
        },
    });

    testServerRoute(server, '/api/admin/projects', {
        projects: [...Array(existingProjectsCount).keys()].map((_, i) => ({
            name: `project${i}`,
        })),
    });
};

test('Enabled new project button when limits, version and permission allow for it', async () => {
    setupApi(0);
    render(<CreateProjectDialog open={true} onClose={() => {}} />, {
        permissions: [{ permission: CREATE_PROJECT }],
    });

    await waitFor(async () => {
        const button = await screen.findByRole('button', {
            name: 'Create project',
        });
        expect(button).not.toBeDisabled();
    });
});

test('Project limit reached', async () => {
    setupApi(1);
    render(<CreateProjectDialog open={true} onClose={() => {}} />, {
        permissions: [{ permission: CREATE_PROJECT }],
    });

    await screen.findByText('You have reached the limit for projects');

    const button = await screen.findByRole('button', {
        name: 'Create project',
    });
    expect(button).toHaveAttribute('aria-disabled', 'true');
});
