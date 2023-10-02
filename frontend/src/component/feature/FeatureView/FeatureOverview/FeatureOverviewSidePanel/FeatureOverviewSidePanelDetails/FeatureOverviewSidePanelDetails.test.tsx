import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from 'utils/testRenderer';
import { FeatureOverviewSidePanelDetails } from './FeatureOverviewSidePanelDetails';
import { IDependency, IFeatureToggle } from 'interfaces/featureToggle';
import { testServerRoute, testServerSetup } from 'utils/testServer';

const server = testServerSetup();

const setupApi = () => {
    testServerRoute(server, '/api/admin/ui-config', {
        flags: {
            dependentFeatures: true,
        },
    });
    testServerRoute(server, '/api/admin/projects/default/features/feature', {});
    testServerRoute(
        server,
        '/api/admin/projects/default/features/feature/parents',
        {},
    );
};

beforeEach(() => {
    setupApi();
});

test('show dependency dialogue', async () => {
    render(
        <FeatureOverviewSidePanelDetails
            feature={
                {
                    name: 'feature',
                    project: 'default',
                    dependencies: [] as Array<{ feature: string }>,
                    children: [] as string[],
                } as IFeatureToggle
            }
            header={''}
        />,
        {permissions: [{permission: 'UPDATE_DEPENDENCY', project: 'default'}]}
    );

    const addParentButton = await screen.findByText('Add parent feature');

    addParentButton.click();

    expect(
        screen.getByText('Add parent feature dependency'),
    ).toBeInTheDocument();
});

test('show child', async () => {
    render(
        <FeatureOverviewSidePanelDetails
            feature={
                {
                    name: 'feature',
                    project: 'default',
                    dependencies: [] as Array<{ feature: string }>,
                    children: ['some_child'],
                } as IFeatureToggle
            }
            header={''}
        />,
    );

    await screen.findByText('Children:');
    await screen.findByText('1 feature');
});

test('show children', async () => {
    render(
        <FeatureOverviewSidePanelDetails
            feature={
                {
                    name: 'feature',
                    project: 'default',
                    dependencies: [] as Array<{ feature: string }>,
                    children: ['some_child', 'some_other_child'],
                } as IFeatureToggle
            }
            header={''}
        />,
    );

    await screen.findByText('Children:');
    await screen.findByText('2 features');
});

test('delete dependency', async () => {
    render(
        <FeatureOverviewSidePanelDetails
            feature={
                {
                    name: 'feature',
                    project: 'default',
                    dependencies: [{ feature: 'some_parent' }],
                    children: [] as string[],
                } as IFeatureToggle
            }
            header={''}
        />,
        {permissions: [{permission: 'UPDATE_DEPENDENCY', project: 'default'}]}
    );

    await screen.findByText('Dependency:');
    await screen.findByText('some_parent');

    const actionsButton = screen.getByRole('button', {
        name: /Dependency actions/i,
    });
    userEvent.click(actionsButton);

    const deleteButton = await screen.findByText('Delete');
    userEvent.click(deleteButton);
});

test('edit dependency', async () => {
    render(
        <FeatureOverviewSidePanelDetails
            feature={
                {
                    name: 'feature',
                    project: 'default',
                    dependencies: [{ feature: 'some_parent' }],
                    children: [] as string[],
                } as IFeatureToggle
            }
            header={''}
        />,
        {permissions: [{permission: 'UPDATE_DEPENDENCY', project: 'default'}]}
    );

    await screen.findByText('Dependency:');
    await screen.findByText('some_parent');

    const actionsButton = screen.getByRole('button', {
        name: /Dependency actions/i,
    });
    userEvent.click(actionsButton);

    const editButton = await screen.findByText('Edit');
    userEvent.click(editButton);

    await screen.findByText('Add parent feature dependency');
});
