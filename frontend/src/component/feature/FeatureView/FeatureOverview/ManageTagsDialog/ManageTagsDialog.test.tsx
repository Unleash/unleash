import { expect, test } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router';
import { render } from 'utils/testRenderer';
import { badRequest, testServerRoute, testServerSetup } from 'utils/testServer';
import ToastRenderer from 'component/common/ToastRenderer/ToastRenderer';
import { ManageTagsDialog } from './ManageTagsDialog.tsx';

const server = testServerSetup();

const setupTags = () => {
    testServerRoute(server, '/api/admin/tag-types', {
        tagTypes: [{ name: 'simple', description: '', icon: '' }],
    });
    testServerRoute(server, '/api/admin/tags/simple', {
        tags: [{ value: 'existing', type: 'simple' }],
    });
    testServerRoute(server, '/api/admin/features/flag-1/tags', {
        version: 1,
        tags: [],
    });
};

const renderDialog = async () => {
    render(
        <>
            <Routes>
                <Route
                    path='/projects/:projectId/features/:featureId'
                    element={<ManageTagsDialog open setOpen={() => {}} />}
                />
            </Routes>
            <ToastRenderer />
        </>,
        { route: '/projects/default/features/flag-1' },
    );
    await screen.findByDisplayValue('simple');
};

test.each([
    ['a single emoji', '🚀'],
    ['a value longer than 50 characters', 'a'.repeat(51)],
])('does not offer to create %s', async (_, value) => {
    setupTags();
    await renderDialog();

    await userEvent.type(screen.getByLabelText('Select values'), value);

    expect(await screen.findByText('No options')).toBeInTheDocument();
});

test('offers to create a value of two emoji', async () => {
    setupTags();
    await renderDialog();

    await userEvent.type(screen.getByLabelText('Select values'), '🚀🚀');

    expect(
        await screen.findByRole('option', {
            name: 'Create new value "🚀🚀"',
        }),
    ).toBeInTheDocument();
});

test('saves a newly created value as a tag of the flag', async () => {
    setupTags();
    testServerRoute(
        server,
        '/api/admin/tags',
        { value: 'Created-by-team', type: 'simple' },
        'post',
        201,
    );
    const { requests } = testServerRoute(
        server,
        '/api/admin/features/flag-1/tags',
        {},
        'put',
    );
    await renderDialog();

    await userEvent.type(
        screen.getByLabelText('Select values'),
        'Created-by-team',
    );
    await userEvent.click(
        await screen.findByRole('option', {
            name: 'Create new value "Created-by-team"',
        }),
    );
    const saveButton = screen.getByRole('button', { name: 'Save tags' });
    await waitFor(() => expect(saveButton).toBeEnabled());
    await userEvent.click(saveButton);

    await screen.findByText('Updated flag tags');
    expect(requests).toEqual([
        {
            addedTags: [{ value: 'Created-by-team', type: 'simple' }],
            removedTags: [],
        },
    ]);
});

test('explains why a new value could not be created and leaves it out', async () => {
    setupTags();
    testServerRoute(
        server,
        '/api/admin/tags',
        badRequest('The tag value is not allowed'),
        'post',
        400,
    );
    await renderDialog();

    await userEvent.type(screen.getByLabelText('Select values'), 'new-value');
    await userEvent.click(
        await screen.findByRole('option', {
            name: 'Create new value "new-value"',
        }),
    );

    await screen.findByText('The tag value is not allowed');
    expect(screen.getByRole('button', { name: 'Save tags' })).toBeDisabled();
});

test('does not report success when saving the tags fails', async () => {
    setupTags();
    testServerRoute(
        server,
        '/api/admin/features/flag-1/tags',
        badRequest('The tags could not be saved'),
        'put',
        400,
    );
    await renderDialog();

    await userEvent.click(screen.getByLabelText('Select values'));
    await userEvent.click(
        await screen.findByRole('option', { name: 'existing' }),
    );
    const saveButton = screen.getByRole('button', { name: 'Save tags' });
    await waitFor(() => expect(saveButton).toBeEnabled());
    await userEvent.click(saveButton);

    await screen.findByText('The tags could not be saved');
    expect(screen.queryByText('Updated flag tags')).not.toBeInTheDocument();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
});
