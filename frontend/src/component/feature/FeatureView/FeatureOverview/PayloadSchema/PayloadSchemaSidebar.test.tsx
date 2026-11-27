import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { Route, Routes } from 'react-router';
import { beforeEach, expect, test } from 'vitest';
import { UPDATE_FEATURE } from 'component/providers/AccessProvider/permissions';
import { render } from 'utils/testRenderer';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import { PayloadSchemaSidebar } from './PayloadSchemaSidebar.tsx';

const server = testServerSetup();

const flagPath = '/api/admin/projects/default/features/my-flag';
const inferredPath = `${flagPath}/payload-schema/inferred`;

beforeEach(() => {
    testServerRoute(server, inferredPath, {
        schema: { type: 'object', examples: [] },
    });
});

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
const pickTemplate = async (name: RegExp) => {
    await userEvent.click(
        await screen.findByRole('tab', { name: 'Use a template' }),
    );
    await userEvent.click(await screen.findByRole('button', { name }));
};

const saveButton = () => screen.getByRole('button', { name: 'Save schema' });

test('saves the payload schema shown in the editor once, even on a double-click, without inferring one', async () => {
    let inferredRequests = 0;
    server.use(
        http.get(inferredPath, () => {
            inferredRequests++;
            return HttpResponse.json({});
        }),
    );
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
    expect(inferredRequests).toBe(0);
});

test('a draft stays on its tab until it is used, and only the staged schema can be saved', async () => {
    testServerRoute(server, flagPath, {});
    renderPayloadSchemaSidebar();

    await screen.findByText('This flag has no JSON variant payloads yet');
    expect(applyButton()).toHaveAttribute('aria-disabled', 'true');

    await pickTemplate(/^Log level/);
    expect(await screen.findByLabelText('Level')).toBeInTheDocument();
    expect(saveButton()).toHaveAttribute('aria-disabled', 'true');

    await userEvent.click(
        screen.getByRole('tab', { name: 'Import JSON Schema' }),
    );
    expect(screen.queryByLabelText('Level')).toBeNull();
    await userEvent.click(screen.getByRole('tab', { name: 'Use a template' }));
    expect(
        await screen.findByRole('button', { name: /^Log level/ }),
    ).toHaveAttribute('aria-pressed', 'true');
    expect(await screen.findByLabelText('Level')).toBeInTheDocument();
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

    await pickTemplate(/^Maintenance mode/);
    await userEvent.click(applyButton());

    expect(screen.queryByText('Invalid payload schema')).toBeNull();
});

test('starts from a schema inferred from the payloads already stored in the flag', async () => {
    const inferredSchema = {
        type: 'object',
        properties: { color: { type: 'string' } },
        examples: [{ color: 'blue' }, { color: 'red' }],
    };
    testServerRoute(server, flagPath, {});
    testServerRoute(server, inferredPath, { schema: inferredSchema });
    const { requests } = testServerRoute(
        server,
        `${flagPath}/payload-schema`,
        null,
        'put',
        204,
    );
    renderPayloadSchemaSidebar();

    const examples = await screen.findByRole('region', {
        name: 'JSON values your app already uses',
    });
    await within(examples).findByText('Example 2');
    expect(await screen.findByLabelText(/color/i)).toBeInTheDocument();

    await userEvent.click(applyButton());
    await userEvent.click(saveButton());

    await waitFor(() => expect(requests).toEqual([{ schema: inferredSchema }]));
});

test('nothing can be used from the stored payloads when they fail to load', async () => {
    testServerRoute(server, flagPath, {});
    testServerRoute(server, inferredPath, {}, 'get', 500);
    renderPayloadSchemaSidebar();

    await screen.findByText(
        'An error occurred while trying to get Inferred payload schema.',
    );
    expect(applyButton()).toHaveAttribute('aria-disabled', 'true');
});

test('explains that nothing can be used from stored payloads that are not all JSON objects', async () => {
    testServerRoute(server, flagPath, {});
    testServerRoute(server, inferredPath, {}, 'get', 409);
    renderPayloadSchemaSidebar();

    await screen.findByText(
        'Examples can only be shown when every JSON variant payload is an object or an array',
    );
    expect(applyButton()).toHaveAttribute('aria-disabled', 'true');
});

test('an uploaded JSON Schema file becomes the import draft', async () => {
    testServerRoute(server, flagPath, {});
    renderPayloadSchemaSidebar();

    await userEvent.click(
        await screen.findByRole('tab', { name: 'Import JSON Schema' }),
    );
    await userEvent.upload(
        screen.getByTestId('json-file-input'),
        new File(
            [
                JSON.stringify({
                    type: 'object',
                    properties: { region: { type: 'string', title: 'Region' } },
                }),
            ],
            'schema.json',
        ),
    );

    expect(await screen.findByLabelText('Region')).toBeInTheDocument();
});
