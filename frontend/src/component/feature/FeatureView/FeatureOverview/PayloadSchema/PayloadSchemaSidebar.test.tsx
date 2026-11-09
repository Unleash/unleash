import { screen, waitFor } from '@testing-library/react';
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
    await userEvent.dblClick(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() =>
        expect(screen.queryByRole('button', { name: 'Save' })).toBeNull(),
    );
    expect(requests).toEqual([{ schema: { type: 'string' } }]);
});

test('shows why the server refused a payload schema until the schema changes', async () => {
    testServerRoute(server, flagPath, { payloadSchema: { type: 'string' } });
    testServerRoute(
        server,
        `${flagPath}/payload-schema`,
        { details: [{ message: 'Invalid payload schema' }] },
        'put',
        400,
    );
    renderPayloadSchemaSidebar();

    await screen.findByText(/"string"/);
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
        'Invalid payload schema',
    );
    expect(screen.getByRole('button', { name: 'Save' })).not.toHaveAttribute(
        'aria-disabled',
    );

    await userEvent.click(screen.getByLabelText('Start from a template'));
    await userEvent.click(
        await screen.findByRole('option', { name: 'Log level' }),
    );

    expect(screen.queryByRole('alert')).toBeNull();
});
