import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router';
import { expect, test } from 'vitest';
import { UPDATE_FEATURE } from 'component/providers/AccessProvider/permissions';
import { render } from 'utils/testRenderer';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import { PayloadSchemaSidebar } from './PayloadSchemaSidebar.tsx';

const server = testServerSetup();

const flagPath = '/api/admin/projects/default/features/my-flag';

const renderPayloadSchemaSidebar = () => {
    render(
        <Routes>
            <Route
                path='/projects/:projectId/features/:featureId/payload-schema'
                element={<PayloadSchemaSidebar />}
            />
        </Routes>,
        {
            route: '/projects/default/features/my-flag/payload-schema',
            permissions: [{ permission: UPDATE_FEATURE, project: 'default' }],
        },
    );
};

const applyButton = () =>
    screen.getByRole('button', { name: 'Use these fields' });
const pickTemplate = async (name: RegExp) =>
    userEvent.click(await screen.findByRole('button', { name }));

const saveButton = () => screen.getByRole('button', { name: 'Save schema' });

test('saves the payload schema shown in the editor once, even on a double-click', async () => {
    testServerRoute(server, flagPath, { payloadSchema: { type: 'string' } });
    const { requests } = testServerRoute(
        server,
        `${flagPath}/payload-schema`,
        null,
        'put',
        204,
    );
    renderPayloadSchemaSidebar();

    await screen.findByText('Edit payload schema');
    await screen.findByText(/"string"/);
    await userEvent.dblClick(
        screen.getByRole('button', { name: 'Save changes' }),
    );

    await waitFor(() =>
        expect(
            screen.queryByRole('button', { name: 'Save changes' }),
        ).toBeNull(),
    );
    expect(requests).toEqual([{ schema: { type: 'string' } }]);
});

test('a draft is staged only by using it, and only the staged schema can be saved', async () => {
    testServerRoute(server, flagPath, {});
    renderPayloadSchemaSidebar();

    await pickTemplate(/^Log level/);
    expect(await screen.findByLabelText('Level')).toBeInTheDocument();
    expect(saveButton()).toHaveAttribute('aria-disabled', 'true');
    expect(
        within(
            screen.getByRole('region', { name: 'Choose a template' }),
        ).queryByRole('button', { name: 'Cancel' }),
    ).toBeNull();

    await userEvent.click(applyButton());
    screen.getByRole('region', { name: 'Payload schema' });
    expect(
        screen.queryByRole('tab', { selected: true }),
    ).not.toBeInTheDocument();
    expect(saveButton()).not.toHaveAttribute('aria-disabled');

    await userEvent.click(screen.getByRole('tab', { name: 'Use a template' }));
    await pickTemplate(/^Maintenance mode/);
    expect(await screen.findByLabelText('Message')).toBeInTheDocument();
    expect(saveButton()).toHaveAttribute('aria-disabled', 'true');

    await userEvent.click(
        within(
            screen.getByRole('region', { name: 'Choose a template' }),
        ).getByRole('button', { name: 'Cancel' }),
    );
    expect(await screen.findByLabelText('Level')).toBeInTheDocument();
    expect(screen.queryByLabelText('Message')).toBeNull();

    await userEvent.click(screen.getByRole('tab', { name: 'Use a template' }));
    await pickTemplate(/^Maintenance mode/);
    await userEvent.click(applyButton());

    expect(await screen.findByLabelText('Message')).toBeInTheDocument();
    expect(screen.queryByLabelText('Level')).toBeNull();
});

test('shows why the server refused a payload schema until the schema changes', async () => {
    testServerRoute(server, flagPath, {});
    testServerRoute(
        server,
        `${flagPath}/payload-schema`,
        { details: [{ message: 'Invalid payload schema' }] },
        'put',
        400,
    );
    renderPayloadSchemaSidebar();

    await pickTemplate(/^Log level/);
    await userEvent.click(applyButton());
    await userEvent.click(saveButton());

    await screen.findByText('Invalid payload schema');
    expect(saveButton()).not.toHaveAttribute('aria-disabled');

    await userEvent.click(screen.getByRole('tab', { name: 'Use a template' }));
    await pickTemplate(/^Maintenance mode/);
    await userEvent.click(applyButton());

    expect(screen.queryByText('Invalid payload schema')).toBeNull();
});
