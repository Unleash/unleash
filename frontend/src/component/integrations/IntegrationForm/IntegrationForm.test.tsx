import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test } from 'vitest';
import { render } from 'utils/testRenderer';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import type { AddonTypeSchema } from 'openapi';
import { CREATE_ADDON } from 'component/providers/AccessProvider/permissions';
import { DEFAULT_DATA } from '../CreateIntegration/CreateIntegration.tsx';
import { IntegrationForm } from './IntegrationForm.tsx';

const server = testServerSetup();
testServerRoute(server, '/api/admin/projects', { projects: [] });
testServerRoute(server, '/api/admin/environments', { environments: [] });
testServerRoute(server, '/api/admin/ui-config', {});

const renderForm = (provider: Partial<AddonTypeSchema>) =>
    render(
        <IntegrationForm
            editMode={false}
            provider={{
                name: 'github',
                displayName: 'GitHub',
                description: 'Creates cleanup issues',
                documentationUrl: 'https://example.com',
                parameters: [],
                events: ['feature-completed'],
                ...provider,
            }}
            addon={{ ...DEFAULT_DATA, provider: 'github' }}
            fetch={() => {}}
        />,
        { permissions: [{ permission: CREATE_ADDON }] },
    );

test('should let the user pick events and environments by default', () => {
    renderForm({});

    expect(screen.getByTestId('select-event-input')).toBeInTheDocument();
    expect(screen.getByTestId('select-environment-input')).toBeInTheDocument();
});

test('should hide both pickers when the provider fixes the events and is environment independent', () => {
    renderForm({ fixedEvents: true, environmentIndependent: true });

    expect(screen.queryByTestId('select-event-input')).not.toBeInTheDocument();
    expect(
        screen.queryByTestId('select-environment-input'),
    ).not.toBeInTheDocument();
});

test('should save the fixed events and no environments when the pickers are hidden', async () => {
    const { requests } = testServerRoute(
        server,
        '/api/admin/addons',
        { id: 1 },
        'post',
    );
    renderForm({ fixedEvents: true, environmentIndependent: true });

    await userEvent.click(screen.getByRole('button', { name: 'Create' }));

    await waitFor(() => expect(requests).toHaveLength(1));
    expect(requests[0]).toMatchObject({
        events: ['feature-completed'],
        environments: [],
    });
});
