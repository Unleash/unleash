import { ArchiveTable } from './ArchiveTable';
import { render } from 'utils/testRenderer';
import { useState } from 'react';
import { screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
    DELETE_FEATURE,
    UPDATE_FEATURE,
} from 'component/providers/AccessProvider/permissions';
import ToastRenderer from 'component/common/ToastRenderer/ToastRenderer';
import { testServerRoute, testServerSetup } from 'utils/testServer';

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
        archived: true,
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
        archived: true,
    },
];

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
            projectId='default'
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

    testServerRoute(server, '/api/admin/ui-config', {
        environment: 'Open Source',
    });
};

test('should load the table', async () => {
    render(<Component />, { permissions: [{ permission: UPDATE_FEATURE }] });
    expect(screen.getByRole('table')).toBeInTheDocument();

    await screen.findByText('someFeature');
});

test('should show confirm dialog when reviving toggle', async () => {
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
        'revive-feature-toggle-button',
    )?.[0];
    fireEvent.click(reviveButton);

    await screen.findByText('Revive feature toggle?');
    const reviveTogglesButton = screen.getByRole('button', {
        name: /Revive feature toggle/i,
    });
    fireEvent.click(reviveTogglesButton);

    await screen.findByText("And we're back!");
});

test('should show confirm dialog when batch reviving toggle', async () => {
    setupApi();
    render(
        <>
            <ToastRenderer />
            <Component />
        </>,
        {
            permissions: [
                { permission: UPDATE_FEATURE, project: 'default' },
                { permission: DELETE_FEATURE, project: 'default' },
            ],
        },
    );
    await screen.findByText('someFeature');

    const selectAll = await screen.findByTestId('select_all_rows');
    fireEvent.click(selectAll.firstChild!);
    const batchReviveButton = await screen.findByText(/Revive/i);
    await userEvent.click(batchReviveButton!);

    await screen.findByText('Revive feature toggles?');

    const reviveTogglesButton = screen.getByRole('button', {
        name: /Revive feature toggles/i,
    });
    fireEvent.click(reviveTogglesButton);

    await screen.findByText("And we're back!");
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
        'revive-feature-toggle-button',
    )?.[0];
    fireEvent.click(reviveButton);

    await screen.findByText('Revive feature toggle?');
    await screen.findByText(
        'Revived feature toggles will be automatically disabled in all environments',
    );
});
