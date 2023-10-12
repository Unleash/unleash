import { ArchiveTable } from './ArchiveTable';
import { render } from 'utils/testRenderer';
import { useState } from 'react';
import { screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UPDATE_FEATURE } from 'component/providers/AccessProvider/permissions';
import ToastRenderer from '../../common/ToastRenderer/ToastRenderer';
import { testServerRoute, testServerSetup } from '../../../utils/testServer';

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
            refetch={() => {}}
            loading={false}
            setStoredParams={setStoredParams as any}
            storedParams={storedParams as any}
        />
    );
};

const server = testServerSetup();

testServerRoute(server, '/api/admin/projects/default/revive', {}, 'post', 200);

test('should load the table', async () => {
    render(<Component />, { permissions: [{ permission: UPDATE_FEATURE }] });
    expect(screen.getByRole('table')).toBeInTheDocument();

    await screen.findByText('someFeature');
});

test('should show confirm dialog when reviving toggle', async () => {
    render(
        <>
            <ToastRenderer />
            <Component />{' '}
        </>,
        { permissions: [{ permission: UPDATE_FEATURE }] },
    );
    await screen.findByText('someFeature');

    const reviveButton = screen.getAllByTestId(
        'revive-feature-toggle-button',
    )?.[0];
    await userEvent.click(reviveButton);

    await screen.findByText('Revive feature toggle?');
    const reviveTogglesButton = screen.getByRole('button', {
        name: /Revive feature toggle/i,
    });
   fireEvent.click(reviveTogglesButton);

    await screen.findByText("And we're back!");
});

test('should show confirm dialog when batch reviving toggle', async () => {
    render(<Component />, { permissions: [{ permission: UPDATE_FEATURE }] });

    await screen.findByText('someFeature');

    const selectAll = await screen.findByTestId('select_all_rows');
    await userEvent.click(selectAll);

    const batchReviveButton = await screen.findByText('Revive');
    await userEvent.click(batchReviveButton);

    await screen.findByText('Revive feature toggles?');

    const reviveTogglesButton = screen.getByRole('button', {
        name: /Revive feature toggles/i,
    });
    await userEvent.click(reviveTogglesButton);

    await screen.findByText("And we're back!");
});
