import { fireEvent, screen, waitFor } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import { AddDependencyDialogue } from './AddDependencyDialogue.tsx';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import { http, HttpResponse } from 'msw';
import type { IDependency } from 'interfaces/featureToggle';
import type { IChangeSchema } from 'hooks/api/actions/useChangeRequestApi/useChangeRequestApi';

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
        '/api/admin/projects/default/features/parentA/parent-variants',
        ['variantA', 'variantB'],
    );

    testServerRoute(
        server,
        '/api/admin/projects/default/features/child/parents',
        ['parentA', 'parentB'],
    );

    testServerRoute(server, '/api/admin/projects/default/features/child', {
        dependencies: [{ feature: 'parentB', enabled: true, variants: [] }],
    });
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

test.skip('Edit dependency', async () => {
    let closed = false;
    let dependency: IDependency;
    setupApi();
    server.use(
        http.post(
            '/api/admin/projects/default/features/child/dependencies',
            async ({ request }) => {
                dependency = (await request.json()) as IDependency;
                return new HttpResponse(null, { status: 200 });
            },
        ),
    );

    render(
        <AddDependencyDialogue
            project='default'
            featureId='child'
            parentDependency={{ feature: 'parentB' }}
            showDependencyDialogue={true}
            onClose={() => {
                closed = true;
            }}
        />,
    );

    const addDependency = await screen.findByText('Add');

    await waitFor(() => {
        expect(addDependency).not.toBeDisabled();
    });

    // Open the dropdown by selecting the role.
    const [featureDropdown, featureStatusDropdown] =
        screen.queryAllByRole('combobox');

    await waitFor(() => {
        expect(featureDropdown.innerHTML).toBe('parentB');
    });
    fireEvent.click(featureDropdown);

    // select parent
    const parentAOption = await screen.findByText('parentA');
    fireEvent.click(parentAOption);

    // select parent status
    await screen.findByText('feature status');
    expect(featureStatusDropdown.innerHTML).toBe('enabled');
    fireEvent.click(featureStatusDropdown);
    const enabledWithVariants = await screen.findByText(
        'enabled with variants',
    );
    fireEvent.click(enabledWithVariants);

    // select variant
    await screen.findByText('variant');
    const variantDropdown = await screen.findByPlaceholderText('Select values');
    fireEvent.click(variantDropdown);
    const variantA = await screen.findByText('variantA');
    fireEvent.click(variantA);

    // add dependency
    const addButton = await screen.findByText('Add');
    fireEvent.click(addButton);

    await screen.findByText('Client SDK support for feature dependencies');

    await waitFor(() => {
        expect(closed).toBe(true);
        expect(dependency).toEqual({
            feature: 'parentA',
            enabled: true,
            variants: ['variantA'],
        });
    });
});

test('Add change to draft', async () => {
    let closed = false;
    let change: IChangeSchema[];
    setupApi();
    setupChangeRequestApi();
    server.use(
        http.post(
            '/api/admin/projects/default/environments/development/change-requests',
            async ({ request }) => {
                change = (await request.json()) as IChangeSchema[];
                return new HttpResponse(null, { status: 201 });
            },
        ),
    );
    render(
        <AddDependencyDialogue
            project='default'
            featureId='child'
            parentDependency={{ feature: 'parentB' }}
            showDependencyDialogue={true}
            onClose={() => {
                closed = true;
            }}
        />,
    );

    const addChangeToDraft = await screen.findByText('Add change to draft');

    fireEvent.click(addChangeToDraft);

    await waitFor(() => {
        expect(closed).toBe(true);
        expect(change).toEqual([
            {
                action: 'addDependency',
                feature: 'child',
                payload: { feature: 'parentB', enabled: true, variants: [] },
            },
        ]);
    });
});
