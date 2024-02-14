import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from 'utils/testRenderer';
import { AddDependencyDialogue } from './AddDependencyDialogue';
import { testServerRoute, testServerSetup } from 'utils/testServer';

const server = testServerSetup();

const setupApi = () => {
    testServerRoute(server, '/api/admin/ui-config', {
        versionInfo: {
            current: { oss: 'irrelevant', enterprise: 'some value' },
        },
    });

    testServerRoute(
        server,
        '/api/admin/projects/default/features/child/dependencies',
        {},
        'delete',
    );

    testServerRoute(
        server,
        '/api/admin/projects/default/features/child/dependencies',
        {},
        'post',
    );

    testServerRoute(
        server,
        '/api/admin/projects/default/features/child/parents',
        ['parentA', 'parentB'],
    );
};

const setupChangeRequestApi = () => {
    testServerRoute(
        server,
        '/api/admin/projects/default/change-requests/config',
        [
            {
                environment: 'development',
                type: 'development',
                requiredApprovals: null,
                changeRequestEnabled: true,
            },
        ],
    );
    testServerRoute(
        server,
        'api/admin/projects/default/change-requests/pending',
        [],
    );
};

test('Delete dependency', async () => {
    let closed = false;
    setupApi();
    render(
        <AddDependencyDialogue
            project='default'
            featureId='child'
            showDependencyDialogue={true}
            onClose={() => {
                closed = true;
            }}
        />,
    );

    const removeDependency = await screen.findByText('Remove');

    await waitFor(() => {
        expect(removeDependency).not.toBeDisabled();
    });

    removeDependency.click();

    await waitFor(() => {
        expect(closed).toBe(true);
    });
});

test('Add dependency', async () => {
    let closed = false;
    setupApi();
    render(
        <AddDependencyDialogue
            project='default'
            featureId='child'
            showDependencyDialogue={true}
            onClose={() => {
                closed = true;
            }}
        />,
    );

    const removeDependency = await screen.findByText('Remove');

    await waitFor(() => {
        expect(removeDependency).not.toBeDisabled();
    });

    // Open the dropdown by selecting the role.
    const dropdown = screen.queryAllByRole('combobox')[0];
    userEvent.click(dropdown);

    const parentAOption = await screen.findByText('parentA');
    userEvent.click(parentAOption);

    const addButton = await screen.findByText('Add');
    userEvent.click(addButton);

    await screen.findByText('Client SDK support for feature dependencies');

    await waitFor(() => {
        expect(closed).toBe(true);
    });
});

test('Add change to draft', async () => {
    let closed = false;
    setupApi();
    setupChangeRequestApi();
    render(
        <AddDependencyDialogue
            project='default'
            featureId='child'
            showDependencyDialogue={true}
            onClose={() => {
                closed = true;
            }}
        />,
    );

    const addChangeToDraft = await screen.findByText('Add change to draft');

    userEvent.click(addChangeToDraft);

    await waitFor(() => {
        expect(closed).toBe(true);
    });
});
