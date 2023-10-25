import { testServerRoute, testServerSetup } from "utils/testServer";
import { render } from "utils/testRenderer";
import userEvent from '@testing-library/user-event';
import { screen } from "@testing-library/react";
import { PlaygroundConnectionFieldset } from "./PlaygroundConnectionFieldset";
import {useState} from 'react'
import { aw } from "../../../../../../build/static/index-1365192c";

const server = testServerSetup();

beforeEach(() => {
  testServerRoute(
    server,
    'api/admin/ui-config',
    {
      flags: {
        playgroundImprovements: true,
      },
    },
    'get',
    200,
  );
  testServerRoute(
    server,
    '/api/admin/projects',
    {
      projects: [{
        id: 'default',
        name: 'Default'
      }, {
        id: 'MyProject',
        name: 'MyProject'
      }],
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
  )
}

test('should parse project and environment from token input', async () => {
  render(<Component />);

  const user = userEvent.setup();
  const tokenInput = await screen.findByTestId('PLAYGROUND_TOKEN_INPUT');
  await user.type(
    tokenInput,
    'default:development.964a287e1b728cb5f4f3e0120df92cb5',
  );

  const projectInput = await screen.findByTestId('PLAYGROUND_PROJECT_SELECT');
  const environmentInput = await screen.findByTestId(
    'PLAYGROUND_ENVIRONMENT_SELECT',
  );

  expect(projectInput).toBeDisabled();
  expect(projectInput).toHaveValue('default');
  expect(environmentInput).toBeDisabled();
  expect(environmentInput).toHaveValue('development');
});

test('should load projects from token definition if project is []', async () => {
  testServerRoute(
    server,
    '/api/admin/api-tokens/*',
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

  render(<Component />);

  const user = userEvent.setup();
  const tokenInput = screen.getByTestId('PLAYGROUND_TOKEN_INPUT');
  await user.type(
    tokenInput,
    '[]:development.964a287e1b728cb5f4f3e0120df92cb5',
  );

  const projectInput = screen.getByTestId('PLAYGROUND_PROJECT_SELECT');
  const environmentInput = screen.getByTestId(
    'PLAYGROUND_ENVIRONMENT_SELECT',
  );

  expect(projectInput).toBeDisabled();
  expect(projectInput).toHaveValue('default, MyProject');
  expect(environmentInput).toBeDisabled();
  expect(environmentInput).toHaveValue('development');
});

test('should show an error when admin token', async () => {
  render(<Component />);

  const user = userEvent.setup();
  const tokenInput = screen.getByTestId('PLAYGROUND_TOKEN_INPUT');
  await user.type(tokenInput, '*:*.964a287e1b728cb5f4f3e0120df92cb5');

  const projectInput = screen.getByTestId('PLAYGROUND_PROJECT_SELECT');
  const environmentInput = screen.getByTestId(
    'PLAYGROUND_ENVIRONMENT_SELECT',
  );

  expect(projectInput).toBeDisabled();
  expect(environmentInput).toBeDisabled();
  await screen.findByText(
    'Admin tokens are not supported in the playground')
});
