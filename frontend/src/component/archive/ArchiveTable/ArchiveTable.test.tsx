import { ArchiveTable } from 'component/archive/ArchiveTable/ArchiveTable';
import { render } from 'utils/testRenderer';
import { useState } from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { UPDATE_FEATURE } from 'component/providers/AccessProvider/permissions';
import ToastRenderer from 'component/common/ToastRenderer/ToastRenderer';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import type { FeatureSearchResponseSchema } from 'openapi';

const mockedFeatures = [
    {
        name: 'someFeature',
        description: '',
        type: 'release',
        project: 'default',
        stale: false,
        createdAt: '2023-08-10T09:28:58.928Z',
        lastSeenAt: null,
        impressionData: false,
        archivedAt: '2023-08-11T10:18:03.429Z',
    },
    {
        name: 'someOtherFeature',
        description: '',
        type: 'release',
        project: 'default',
        stale: false,
        createdAt: '2023-08-10T09:28:58.928Z',
        lastSeenAt: null,
        impressionData: false,
        archivedAt: '2023-08-11T10:18:03.429Z',
    },
] as FeatureSearchResponseSchema[];

const Component = () => {
    const [storedParams, setStoredParams] = useState({});
    return (
        <ArchiveTable
            title='Archived features'
            archivedFeatures={mockedFeatures}
            refetch={() => Promise.resolve({})}
            loading={false}
            setStoredParams={setStoredParams as any}
            storedParams={storedParams as any}
        />
    );
};

const server = testServerSetup();

const setupApi = () => {
    testServerRoute(
        server,
        '/api/admin/projects/default/revive',
        {},
        'post',
        200,
    );

    testServerRoute(server, '/api/admin/projects/default/overview', {
        environment: 'Open Source',
    });
    testServerRoute(server, '/api/admin/ui-config', {
        archivedAt: null,
    });
};

test('should load the table', async () => {
    render(<Component />, { permissions: [{ permission: UPDATE_FEATURE }] });
    expect(screen.getByRole('table')).toBeInTheDocument();

    await screen.findByText('someFeature');
});

test('should show confirm dialog when reviving flag', async () => {
    setupApi();
    render(
        <>
            <ToastRenderer />
            <Component />
        </>,
        { permissions: [{ permission: UPDATE_FEATURE }] },
    );
    await screen.findByText('someFeature');

    const reviveButton = screen.getAllByTestId(
        'revive-feature-flag-button',
    )?.[0];
    fireEvent.click(reviveButton);

    await screen.findByText('Revive feature flag?');
    const reviveFlagsButton = screen.getByRole('button', {
        name: /Revive feature flag/i,
    });
    await waitFor(async () => {
        expect(reviveFlagsButton).toBeEnabled();
    });
    fireEvent.click(reviveFlagsButton);

    await screen.findByText('Feature flags revived');
});

test('should show info box when disableAllEnvsOnRevive flag is on', async () => {
    setupApi();
    render(
        <>
            <ToastRenderer />
            <Component />
        </>,
        { permissions: [{ permission: UPDATE_FEATURE }] },
    );
    await screen.findByText('someFeature');

    const reviveButton = screen.getAllByTestId(
        'revive-feature-flag-button',
    )?.[0];
    fireEvent.click(reviveButton);

    await screen.findByText('Revive feature flag?');
    await screen.findByText(
        'Revived feature flags will be automatically disabled in all environments',
    );
});
