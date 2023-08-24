import { vi } from 'vitest';
import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import { FeatureArchiveDialog } from './FeatureArchiveDialog';
import { UIProviderContainer } from 'component/providers/UIProvider/UIProviderContainer';

const server = testServerSetup();
const setupHappyPathForChangeRequest = () => {
    testServerRoute(
        server,
        '/api/admin/projects/projectId/environments/development/change-requests',
        {},
        'post'
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
        ]
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
        <UIProviderContainer>
            <FeatureArchiveDialog
                featureIds={['featureA']}
                projectId={'projectId'}
                isOpen={true}
                onClose={onClose}
                onConfirm={onConfirm}
                featuresWithUsage={[]}
            />
        </UIProviderContainer>
    );

    expect(screen.getByText('Archive feature toggle')).toBeInTheDocument();
    const button = await screen.findByText('Add change to draft');

    button.click();

    await waitFor(() => {
        expect(onConfirm).toBeCalledTimes(1);
        expect(onClose).toBeCalledTimes(1);
    });
});

test('Add multiple archive feature changes to change request', async () => {
    const onClose = vi.fn();
    const onConfirm = vi.fn();
    setupHappyPathForChangeRequest();
    render(
        <UIProviderContainer>
            <FeatureArchiveDialog
                featureIds={['featureA', 'featureB']}
                projectId={'projectId'}
                isOpen={true}
                onClose={onClose}
                onConfirm={onConfirm}
                featuresWithUsage={[]}
            />
        </UIProviderContainer>
    );

    await screen.findByText('Archive feature toggles');
    const button = await screen.findByText('Add to change request');

    button.click();

    await waitFor(() => {
        expect(onConfirm).toBeCalledTimes(1);
        expect(onClose).toBeCalledTimes(1);
    });
});
