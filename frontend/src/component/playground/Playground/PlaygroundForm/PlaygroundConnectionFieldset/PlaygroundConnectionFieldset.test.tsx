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
    });
    testServerRoute(
        server,
        '/api/admin/projects',

        {
            version: 1,
            projects: [
                {
                    name: 'Default',
                    id: 'default',
                    description: 'Default project',
                    health: 100,
                    favorite: false,
                    featureCount: 0,
                    memberCount: 0,
                    updatedAt: '2023-11-21T15:50:57.035Z',
                    createdAt: '2023-11-10T09:52:14.898Z',
                    mode: 'open',
                    defaultStickiness: 'default',
                },
                {
                    name: 'MyProject',
                    id: 'MyProject',
                    description: '',
                    health: 100,
                    favorite: false,
                    featureCount: 1,
                    memberCount: 1,
                    updatedAt: '2023-11-21T15:50:57.037Z',
                    createdAt: '2023-11-10T09:52:52.169Z',
                    mode: 'open',
                    defaultStickiness: 'sessionId',
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

const timeoutInMilliseconds = 10000;

test(
    'should parse project and environment from token input',
    async () => {
        const { container } = render(<Component />);
        const projectAutocomplete = await screen.findByTestId(
            'PLAYGROUND_PROJECT_SELECT',
        );
        const button = await within(projectAutocomplete).findByRole('button');
        fireEvent.click(button);
        await within(container).findByText('Default');

        const tokenInput = await screen.findByLabelText('API token');
        fireEvent.change(tokenInput, {
            target: {
                value: 'default:development.964a287e1b728cb5f4f3e0120df92cb5',
            },
        });

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
    },
    timeoutInMilliseconds,
);

test('should load projects from token definition if project is []', async () => {
    const { container } = render(<Component />);
    const projectAutocomplete = await screen.findByTestId(
        'PLAYGROUND_PROJECT_SELECT',
    );
    const button = await within(projectAutocomplete).findByRole('button');
    fireEvent.click(button);
    await within(container).findByText('Default');

    const tokenInput = await screen.findByLabelText('API token');
    fireEvent.change(tokenInput, {
        target: { value: '[]:development.964a287e1b728cb5f4f3e0120df92cb5' },
    });

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
    const { container } = render(<Component />);
    const projectAutocomplete = await screen.findByTestId(
        'PLAYGROUND_PROJECT_SELECT',
    );
    const button = await within(projectAutocomplete).findByRole('button');
    fireEvent.click(button);
    await within(container).findByText('Default');

    const tokenInput = await screen.findByLabelText('API token');
    fireEvent.change(tokenInput, {
        target: { value: '*:*.964a287e1b728cb5f4f3e0120df92cb5' },
    });

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

test('should have a working clear button when token is filled', async () => {
    const { container } = render(<Component />);
    const projectAutocomplete = await screen.findByTestId(
        'PLAYGROUND_PROJECT_SELECT',
    );
    const button = await within(projectAutocomplete).findByRole('button');
    fireEvent.click(button);
    await within(container).findByText('Default');

    const tokenInput = await screen.findByLabelText('API token');
    fireEvent.change(tokenInput, {
        target: {
            value: 'default:development.964a287e1b728cb5f4f3e0120df92cb5',
        },
    });

    const clear = await screen.findByTestId('TOKEN_INPUT_CLEAR_BTN');
    const clearButton = within(clear).getByRole('button');
    fireEvent.click(clearButton);

    expect(tokenInput).toHaveValue('');
});
