import { expect, test } from 'vitest';
import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import { CreateProjectDialog } from './CreateProjectDialog.tsx';
import { CREATE_PROJECT } from 'component/providers/AccessProvider/permissions';

const server = testServerSetup();

const setupApi = (existingProjectsCount: number) => {
    testServerRoute(server, '/api/admin/ui-config', {
        resourceLimits: { projects: 1 },
        versionInfo: { current: { enterprise: 'version' } },
    });
    testServerRoute(server, '/api/admin/projects', {
        projects: [...Array(existingProjectsCount).keys()].map((_, index) => ({
            name: `project${index}`,
        })),
    });
    testServerRoute(server, '/api/admin/environments', { environments: [] });
};

const getNameInput = async () => {
    await screen.findByText('New project');
    const wrapper = await screen.findByTestId('PROJECT_FORM_NAME_INPUT');
    return within(wrapper).getByRole('textbox');
};

test('project modal posts the expected payload', async () => {
    setupApi(0);
    const { requests } = testServerRoute(
        server,
        '/api/admin/projects',
        { id: 'auto-generated-id' },
        'post',
        201,
    );

    render(<CreateProjectDialog open={true} onClose={() => {}} />, {
        permissions: [{ permission: CREATE_PROJECT }],
    });

    const nameInput = await getNameInput();
    fireEvent.change(nameInput, { target: { value: 'my-project' } });

    const submit = await screen.findByTestId('PROJECT_FORM_CREATE_BUTTON');
    fireEvent.click(submit);

    await waitFor(() => expect(requests).toHaveLength(1));

    expect(requests[0]).toMatchObject({
        name: 'my-project',
        description: '',
        defaultStickiness: 'default',
        mode: 'open',
    });
});

test('project modal disables Create when limit reached', async () => {
    setupApi(1);

    render(<CreateProjectDialog open={true} onClose={() => {}} />, {
        permissions: [{ permission: CREATE_PROJECT }],
    });

    await screen.findByText('New project');
    await screen.findByText('You have reached the limit for projects');

    const submit = await screen.findByTestId('PROJECT_FORM_CREATE_BUTTON');
    expect(submit).toHaveAttribute('aria-disabled', 'true');
});

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
