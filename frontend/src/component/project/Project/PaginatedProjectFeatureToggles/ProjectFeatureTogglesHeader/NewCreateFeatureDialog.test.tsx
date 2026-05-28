import { beforeEach, expect, test } from 'vitest';
import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import { Route, Routes } from 'react-router-dom';
import { CreateFeatureDialog } from './CreateFeatureDialog.tsx';
import { CREATE_FEATURE } from 'component/providers/AccessProvider/permissions';

const server = testServerSetup();

const setupBaseApi = () => {
    testServerRoute(server, '/api/admin/ui-config', {
        resourceLimits: { featureFlags: 999 },
        versionInfo: { current: { oss: 'version' } },
        flags: { newModalDesign: true },
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
    // Wait for the new-design title; otherwise we may interact during the
    // legacy → new template swap that happens once useUiFlag resolves.
    await screen.findByText('New feature flag');
    const wrapper = await screen.findByTestId('FORM_NAME_INPUT');
    return within(wrapper).getByRole('textbox');
};

beforeEach(() => {
    // useLocalStorageState persists across tests in jsdom; clear so each
    // scenario starts from a clean form.
    localStorage.clear();
});

test('new modal posts the same payload shape as the legacy modal', async () => {
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

test('new modal surfaces backend validation errors', async () => {
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
