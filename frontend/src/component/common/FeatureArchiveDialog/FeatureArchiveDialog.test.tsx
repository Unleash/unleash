import { vi } from 'vitest';
import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import { FeatureArchiveDialog } from './FeatureArchiveDialog';

const server = testServerSetup();
const setupHappyPathForChangeRequest = () => {
    testServerRoute(
        server,
        '/api/admin/projects/projectId/environments/development/change-requests',
        {},
        'post',
    );
    testServerRoute(
        server,
        '/api/admin/projects/projectId/change-requests/config',
        [
            {
                environment: 'development',
                type: 'development',
                requiredApprovals: 1,
                changeRequestEnabled: true,
            },
        ],
    );
    testServerRoute(server, '/api/admin/ui-config', {
        versionInfo: {
            current: { oss: 'version', enterprise: 'version' },
        },
    });
};

test('Add single archive feature change to change request', async () => {
    const onClose = vi.fn();
    const onConfirm = vi.fn();
    setupHappyPathForChangeRequest();
    render(
        <FeatureArchiveDialog
            featureIds={['featureA']}
            projectId={'projectId'}
            isOpen={true}
            onClose={onClose}
            onConfirm={onConfirm}
            featuresWithUsage={[]}
        />,
    );

    expect(screen.getByText('Archive feature toggle')).toBeInTheDocument();
    const button = await screen.findByText('Add change to draft');

    button.click();

    await waitFor(() => {
        expect(onConfirm).toBeCalledTimes(1);
    });
    expect(onClose).toBeCalledTimes(1);
});

test('Add multiple archive feature changes to change request', async () => {
    const onClose = vi.fn();
    const onConfirm = vi.fn();
    setupHappyPathForChangeRequest();
    render(
        <FeatureArchiveDialog
            featureIds={['featureA', 'featureB']}
            projectId={'projectId'}
            isOpen={true}
            onClose={onClose}
            onConfirm={onConfirm}
            featuresWithUsage={[]}
        />,
    );

    await screen.findByText('Archive feature toggles');
    const button = await screen.findByText('Add to change request');

    button.click();

    await waitFor(() => {
        expect(onConfirm).toBeCalledTimes(1);
    });
    expect(onClose).toBeCalledTimes(1);
});

test('Skip change request', async () => {
    const onClose = vi.fn();
    const onConfirm = vi.fn();
    setupHappyPathForChangeRequest();
    render(
        <FeatureArchiveDialog
            featureIds={['featureA', 'featureB']}
            projectId={'projectId'}
            isOpen={true}
            onClose={onClose}
            onConfirm={onConfirm}
            featuresWithUsage={[]}
        />,
        { permissions: [{ permission: 'SKIP_CHANGE_REQUEST' }] },
    );

    await screen.findByText('Archive feature toggles');
    const button = await screen.findByText('Archive toggles');

    button.click();

    await waitFor(() => {
        expect(onClose).toBeCalledTimes(1);
    });
    expect(onConfirm).toBeCalledTimes(0); // we didn't setup non Change Request flow so failure
});
