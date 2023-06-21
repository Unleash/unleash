import { fireEvent, screen, within } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import { UIProviderContainer } from 'component/providers/UIProvider/UIProviderContainer';
import { PlaygroundConnectionFieldset } from './PlaygroundConnectionFieldset';
import { vi } from 'vitest';
import { testServerRoute, testServerSetup } from 'utils/testServer';

const environments: string[] = [];
const availableEnvironments = ['dev', 'prod'];
const projects = ['default'];

const setEnvironments = vi.fn();
const setProjects = vi.fn();

const server = testServerSetup();

test('should render single value select for playground', async () => {
    render(
        <UIProviderContainer>
            <PlaygroundConnectionFieldset
                environments={environments}
                projects={projects}
                setProjects={setProjects}
                setEnvironments={setEnvironments}
                availableEnvironments={availableEnvironments}
            />
        </UIProviderContainer>
    );
    const autocomplete = screen.getByTestId('PLAYGROUND_ENVIRONMENT_SELECT');
    const input = within(autocomplete).getByRole('combobox');
    autocomplete.focus();

    within(autocomplete).getByLabelText('Open').click();
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'Enter' });
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(input).toHaveValue('prod');
});

test('should render multiple value select for advanced playground', async () => {
    testServerRoute(server, '/api/admin/ui-config', {
        flags: {
            advancedPlayground: true,
        },
    });

    render(
        <UIProviderContainer>
            <PlaygroundConnectionFieldset
                environments={environments}
                projects={projects}
                setProjects={setProjects}
                setEnvironments={setEnvironments}
                availableEnvironments={availableEnvironments}
            />
        </UIProviderContainer>
    );
    const autocomplete = screen.getByTestId('PLAYGROUND_ENVIRONMENT_SELECT');
    const input = within(autocomplete).getByRole('combobox');
    autocomplete.focus();

    within(autocomplete).getByLabelText('Open').click();
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'Enter' });
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(setEnvironments).toBeCalledWith(['prod', 'dev']);
});
