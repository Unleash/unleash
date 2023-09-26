import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from 'utils/testRenderer';
import { AddDependencyDialogue } from './AddDependencyDialogue';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import { UIProviderContainer } from '../../providers/UIProvider/UIProviderContainer';

const server = testServerSetup();

const setupApi = () => {
    testServerRoute(server, '/api/admin/ui-config', {
        flags: {
            dependentFeatures: true,
        },
    });

    testServerRoute(
        server,
        '/api/admin/projects/default/features/child/dependencies',
        {},
        'delete'
    );

    testServerRoute(
        server,
        '/api/admin/projects/default/features/child/dependencies',
        {},
        'post'
    );

    testServerRoute(
        server,
        '/api/admin/projects/default/features/child/parents',
        ['parentA', 'parentB']
    );
};

test('Delete dependency', async () => {
    let closed = false;
    setupApi();
    render(
        <UIProviderContainer>
            <AddDependencyDialogue
                featureId="child"
                showDependencyDialogue={true}
                onClose={() => {
                    closed = true;
                }}
            />
        </UIProviderContainer>
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
        <UIProviderContainer>
            <AddDependencyDialogue
                featureId="child"
                showDependencyDialogue={true}
                onClose={() => {
                    closed = true;
                }}
            />
        </UIProviderContainer>
    );

    const removeDependency = await screen.findByText('Remove');

    await waitFor(() => {
        expect(removeDependency).not.toBeDisabled();
    });

    // Open the dropdown by selecting the role.
    const dropdown = screen.queryAllByRole('button')[0];
    userEvent.click(dropdown);

    const parentAOption = await screen.findByText('parentA');
    userEvent.click(parentAOption);

    const addButton = await screen.findByText('Add');
    userEvent.click(addButton);

    await waitFor(() => {
        expect(closed).toBe(true);
    });
});
