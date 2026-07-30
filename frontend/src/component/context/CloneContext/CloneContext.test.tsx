import { expect, test, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router';
import { render } from 'utils/testRenderer';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import { CloneContext } from './CloneContext.tsx';
import {
    CREATE_CONTEXT_FIELD,
    UPDATE_CONTEXT_FIELD,
} from 'component/providers/AccessProvider/permissions';

const server = testServerSetup();

const sourceContextField = {
    name: 'appName',
    description: 'Allows you to constrain on application name',
    sortOrder: 2,
    stickiness: true,
    createdAt: '2023-05-24T06:23:07.797Z',
    legalValues: [
        { value: 'mobile', description: 'Our mobile app' },
        { value: 'web', description: 'Our web app' },
    ],
};

const setupApi = () => {
    testServerRoute(server, '/api/admin/ui-config', {});
    testServerRoute(server, '/api/admin/context', []);
    testServerRoute(server, '/api/admin/context/appName', sourceContextField);
    testServerRoute(server, '/api/admin/context/validate', {}, 'post');
    return testServerRoute(server, '/api/admin/context', {}, 'post');
};

const renderCloneContext = (onSubmit = () => {}) =>
    render(
        <Routes>
            <Route
                path='/context/clone/:name'
                element={
                    <CloneContext onSubmit={onSubmit} onCancel={() => {}} />
                }
            />
        </Routes>,
        {
            route: '/context/clone/appName',
            permissions: [
                { permission: CREATE_CONTEXT_FIELD },
                { permission: UPDATE_CONTEXT_FIELD },
            ],
        },
    );

test('prefills the form with the source context field', async () => {
    setupApi();

    renderCloneContext();

    await screen.findByText('Clone appName');
    await waitFor(() => {
        expect(screen.getByLabelText(/Context name/)).toHaveValue(
            'appName_clone',
        );
    });
    expect(screen.getByLabelText(/Context description/)).toHaveValue(
        sourceContextField.description,
    );
    await screen.findByText('mobile');
    await screen.findByText('web');
});

test('creates a new context field with the legal values of the source', async () => {
    const { requests } = setupApi();
    const onSubmit = vi.fn();

    renderCloneContext(onSubmit);

    const nameInput = await screen.findByLabelText(/Context name/);
    await waitFor(() => expect(nameInput).toHaveValue('appName_clone'));

    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, 'applicationName');
    await userEvent.click(
        screen.getByRole('button', { name: 'Create context' }),
    );

    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(requests).toEqual([
        {
            name: 'applicationName',
            description: sourceContextField.description,
            legalValues: sourceContextField.legalValues,
            stickiness: true,
        },
    ]);
});
