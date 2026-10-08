import { beforeEach, expect, test } from 'vitest';
import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import { Route, Routes } from 'react-router';
import { CreateFeatureDialog } from './CreateFeatureDialog.tsx';
import { CREATE_FEATURE } from 'component/providers/AccessProvider/permissions';

const server = testServerSetup();

const setupBaseApi = () => {
    testServerRoute(server, '/api/admin/ui-config', {
        resourceLimits: { featureFlags: 999 },
        versionInfo: { current: { oss: 'version' } },
    });
    testServerRoute(server, '/api/admin/projects', { projects: [] });
    testServerRoute(server, '/api/admin/projects/default/overview', {
        environments: [],
        featureTypeCounts: [],
    });
    testServerRoute(server, '/api/admin/tags', { tags: [] });
    testServerRoute(server, '/api/admin/feature-types', {
        types: [{ id: 'release', name: 'Release', description: '' }],
    });
    testServerRoute(server, '/api/admin/search/features', {
        features: [],
        total: 0,
    });
};

const renderDialog = () =>
    render(
        <Routes>
            <Route
                path='/projects/:projectId'
                element={<CreateFeatureDialog open={true} onClose={() => {}} />}
            />
        </Routes>,
        {
            route: '/projects/default',
            permissions: [{ permission: CREATE_FEATURE }],
        },
    );

const getNameInput = async () => {
    await screen.findByText('New feature flag');
    const wrapper = await screen.findByTestId('FORM_NAME_INPUT');
    return within(wrapper).getByRole('textbox');
};

beforeEach(() => {
    // useLocalStorageState persists across tests in jsdom; clear so each
    // scenario starts from a clean form.
    localStorage.clear();
});

test('the modal posts the correct payload shape', async () => {
    setupBaseApi();
    testServerRoute(server, '/api/admin/features/validate', {}, 'post', 200);
    const { requests } = testServerRoute(
        server,
        '/api/admin/projects/default/features',
        {},
        'post',
        201,
    );

    renderDialog();

    const nameInput = await getNameInput();
    fireEvent.change(nameInput, { target: { value: 'my-flag' } });

    const submit = await screen.findByTestId('FORM_CREATE_BUTTON');
    fireEvent.click(submit);

    await waitFor(() => expect(requests).toHaveLength(1));

    expect(requests[0]).toEqual({
        type: 'release',
        name: 'my-flag',
        description: '',
        impressionData: false,
    });
});

test('the modal surfaces backend validation errors', async () => {
    setupBaseApi();
    testServerRoute(
        server,
        '/api/admin/features/validate',
        { details: [{ message: '"name" must be URL friendly' }] },
        'post',
        400,
    );

    renderDialog();

    const nameInput = await getNameInput();
    fireEvent.change(nameInput, { target: { value: 'bad name###' } });
    fireEvent.blur(nameInput);

    await screen.findByText('"name" must be URL friendly');
});

test("the name field suggests the project's naming example", async () => {
    setupBaseApi();
    testServerRoute(server, '/api/admin/projects/default/overview', {
        featureNaming: { pattern: '[a-z][a-zA-Z0-9]*', example: 'camelCase' },
    });

    renderDialog();

    await screen.findByPlaceholderText('camelCase');
});

const setupNewFormApi = () => {
    setupBaseApi();
    testServerRoute(server, '/api/admin/ui-config', {
        resourceLimits: { featureFlags: 999 },
        versionInfo: { current: { oss: 'version' } },
        flags: { perFlagLifetime: true },
    });
    testServerRoute(server, '/api/admin/feature-types', {
        types: [
            { id: 'release', name: 'Release', description: '' },
            { id: 'experiment', name: 'Experiment', description: '' },
        ],
    });
    testServerRoute(server, '/api/admin/features/validate', {}, 'post', 200);
    return testServerRoute(
        server,
        '/api/admin/projects/default/features',
        {},
        'post',
        201,
    ).requests;
};

test('the new create flag form posts the default lifetime when the user leaves it untouched', async () => {
    const requests = setupNewFormApi();

    renderDialog();

    const nameInput = await getNameInput();
    fireEvent.change(nameInput, { target: { value: 'my-flag' } });

    fireEvent.click(await screen.findByTestId('FORM_CREATE_BUTTON'));

    await waitFor(() => expect(requests).toHaveLength(1));

    expect(requests[0]).toMatchObject({ type: 'release', lifetimeDays: 30 });
});

test('the new create flag form keeps a chosen lifetime when the type changes', async () => {
    const requests = setupNewFormApi();

    renderDialog();

    const nameInput = await getNameInput();
    fireEvent.change(nameInput, { target: { value: 'my-flag' } });
    fireEvent.click(await screen.findByRole('button', { name: '90 days' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Experiment' }));

    fireEvent.click(await screen.findByTestId('FORM_CREATE_BUTTON'));

    await waitFor(() => expect(requests).toHaveLength(1));

    expect(requests[0]).toEqual({
        type: 'experiment',
        name: 'my-flag',
        description: '',
        impressionData: false,
        lifetimeDays: 90,
    });
});

test('the new create flag form applies the default lifetime of a newly chosen type', async () => {
    const requests = setupNewFormApi();

    renderDialog();

    fireEvent.change(await getNameInput(), { target: { value: 'my-flag' } });
    fireEvent.click(await screen.findByRole('button', { name: 'Kill switch' }));

    fireEvent.click(await screen.findByTestId('FORM_CREATE_BUTTON'));

    await waitFor(() => expect(requests).toHaveLength(1));

    expect(requests[0]).toMatchObject({ type: 'kill-switch', lifetimeDays: 0 });
});

test('the new create flag form posts a zero lifetime for a permanent flag', async () => {
    const requests = setupNewFormApi();

    renderDialog();

    fireEvent.change(await getNameInput(), { target: { value: 'my-flag' } });
    fireEvent.click(await screen.findByRole('button', { name: 'Permanent' }));

    fireEvent.click(await screen.findByTestId('FORM_CREATE_BUTTON'));

    await waitFor(() => expect(requests).toHaveLength(1));

    expect(requests[0]).toMatchObject({ type: 'release', lifetimeDays: 0 });
});

test('the new create flag form restores an unfinished draft when reopened', async () => {
    const requests = setupNewFormApi();

    const firstDialog = renderDialog();
    fireEvent.change(await getNameInput(), { target: { value: 'my-flag' } });
    fireEvent.click(await screen.findByRole('button', { name: '90 days' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Cancel' }));
    firstDialog.unmount();

    renderDialog();
    expect(await getNameInput()).toHaveValue('my-flag');
    const submit = await screen.findByTestId('FORM_CREATE_BUTTON');
    await waitFor(() => expect(submit).toBeEnabled());
    fireEvent.click(submit);

    await waitFor(() => expect(requests).toHaveLength(1));

    expect(requests[0]).toMatchObject({ name: 'my-flag', lifetimeDays: 90 });
});
