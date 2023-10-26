import { testServerRoute, testServerSetup } from 'utils/testServer';
import { render } from 'utils/testRenderer';
import { fireEvent, screen, within } from '@testing-library/react';
import { PlaygroundConnectionFieldset } from './PlaygroundConnectionFieldset';
import { useState } from 'react';

const server = testServerSetup();

beforeEach(() => {
    testServerRoute(server, '/api/admin/ui-config', {
        versionInfo: {
            current: { oss: 'version', enterprise: 'version' },
        },
        flags: {
            playgroundImprovements: true,
        },
    });
    testServerRoute(
        server,
        '/api/admin/projects',
        {
            projects: [
                {
                    id: 'default',
                    name: 'Default',
                },
                {
                    id: 'MyProject',
                    name: 'MyProject',
                },
            ],
        },
        'get',
        200,
    );
    testServerRoute(
        server,
        '/api/admin/api-tokens',
        {
            tokens: [
                {
                    secret: '[]:development.964a287e1b728cb5f4f3e0120df92cb5',
                    projects: ['default', 'MyProject'],
                },
            ],
        },
        'get',
        200,
    );
});

const Component = () => {
    const [environments, setEnvironments] = useState<string[]>([]);
    const [projects, setProjects] = useState<string[]>([]);
    const [token, setToken] = useState<string>();

    const availableEnvironments = ['development', 'production'];

    return (
        <PlaygroundConnectionFieldset
            environments={environments}
            projects={projects}
            token={token}
            setToken={setToken}
            setEnvironments={setEnvironments}
            setProjects={setProjects}
            availableEnvironments={availableEnvironments}
        />
    );
};

test('should parse project and environment from token input', async () => {
    render(<Component />);

    const tokenInput = await screen.findByLabelText('Api token');
    fireEvent.change(tokenInput, {
        target: {
            value: 'default:development.964a287e1b728cb5f4f3e0120df92cb5',
        },
    });

    const projectAutocomplete = await screen.findByTestId(
        'PLAYGROUND_PROJECT_SELECT',
    );
    const projectInput = within(projectAutocomplete).getByRole('combobox');

    const environmentAutocomplete = await screen.findByTestId(
        'PLAYGROUND_ENVIRONMENT_SELECT',
    );
    const environmentInput = within(environmentAutocomplete).getByRole(
        'combobox',
    );

    expect(projectInput).toBeDisabled();
    expect(environmentInput).toBeDisabled();
    await within(projectAutocomplete).findByText('Default');
    await within(environmentAutocomplete).findByText('development');
});

test('should load projects from token definition if project is []', async () => {
    render(<Component />);

    const tokenInput = await screen.findByLabelText('Api token');
    fireEvent.change(tokenInput, {
        target: { value: '[]:development.964a287e1b728cb5f4f3e0120df92cb5' },
    });

    const projectAutocomplete = await screen.findByTestId(
        'PLAYGROUND_PROJECT_SELECT',
    );
    const projectInput = within(projectAutocomplete).getByRole('combobox');

    const environmentAutocomplete = await screen.findByTestId(
        'PLAYGROUND_ENVIRONMENT_SELECT',
    );
    const environmentInput = within(environmentAutocomplete).getByRole(
        'combobox',
    );

    expect(projectInput).toBeDisabled();
    expect(environmentInput).toBeDisabled();
    await within(projectAutocomplete).findByText('Default');
    await within(projectAutocomplete).findByText('MyProject');
    await within(environmentAutocomplete).findByText('development');
});

test('should show an error when admin token', async () => {
    render(<Component />);

    const tokenInput = await screen.findByLabelText('Api token');
    fireEvent.change(tokenInput, {
        target: { value: '*:*.964a287e1b728cb5f4f3e0120df92cb5' },
    });

    const projectAutocomplete = await screen.findByTestId(
        'PLAYGROUND_PROJECT_SELECT',
    );
    const projectInput = within(projectAutocomplete).getByRole('combobox');

    const environmentAutocomplete = await screen.findByTestId(
        'PLAYGROUND_ENVIRONMENT_SELECT',
    );
    const environmentInput = within(environmentAutocomplete).getByRole(
        'combobox',
    );

    expect(projectInput).toBeDisabled();
    expect(environmentInput).toBeDisabled();
    await screen.findByText('Admin tokens are not supported in the playground');
});

test('should have a working clear btn when token is filled', async () => {
    render(<Component />);

    const tokenInput = await screen.findByLabelText('Api token');
    fireEvent.change(tokenInput, {
        target: { value: 'default:development.964a287e1b728cb5f4f3e0120df92cb5' },
    });

    const clearBtn = await screen.findByTestId(
      'TOKEN_INPUT_CLEAR_BTN',
    );
    fireEvent.click(clearBtn);

    expect(tokenInput).toHaveValue('');
});

