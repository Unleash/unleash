import { render } from 'utils/testRenderer';
import { screen, waitFor } from '@testing-library/react';
import { ProjectFeaturesBatchActions } from './ProjectFeaturesBatchActions.tsx';
import { DELETE_FEATURE } from 'component/providers/AccessProvider/permissions';
import { testServerRoute, testServerSetup } from 'utils/testServer';

const server = testServerSetup();

const setupApi = () => {
    testServerRoute(server, '/api/admin/projects/default/stale', {}, 'post');
    testServerRoute(server, '/api/admin/ui-config', {});
    testServerRoute(
        server,
        '/api/admin/projects/default/archive/validate',
        { hasDeletedDependencies: false, parentsWithChildFeatures: [] },
        'post',
    );
};

test('batch archive', async () => {
    setupApi();
    render(
        <ProjectFeaturesBatchActions
            projectId='default'
            onChange={() => {}}
            onResetSelection={() => {}}
            selectedIds={['featureA', 'featureB']}
            data={[]}
        />,
        { permissions: [{ permission: DELETE_FEATURE }] },
    );

    const archiveButton = screen.getByText('Archive');
    expect(archiveButton).toBeEnabled();

    archiveButton.click();

    await screen.findByText('Archive feature flags');
    await screen.findByText('featureA');
    await screen.findByText('featureB');
});

test('batch mark as stale', async () => {
    setupApi();
    let onChangeCalled = false;
    render(
        <ProjectFeaturesBatchActions
            projectId='default'
            onChange={() => {
                onChangeCalled = true;
            }}
            onResetSelection={() => {}}
            selectedIds={['featureA', 'featureB']}
            data={[
                { name: 'featureA', stale: false },
                { name: 'featureB', stale: false },
            ]}
        />,
    );

    const moreActions = screen.getByTitle('More bulk actions');
    moreActions.click();

    const markAsStale = await screen.findByText('Mark as stale');
    expect(markAsStale).toBeEnabled();
    markAsStale.click();

    await waitFor(() => {
        expect(onChangeCalled).toBe(true);
    });
});
