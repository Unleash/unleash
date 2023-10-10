import { ArchiveTable } from './ArchiveTable';
import { render } from 'utils/testRenderer';
import { useState } from 'react';
import { screen, fireEvent } from '@testing-library/react';

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

test('should load the table', async () => {
    render(<Component />);
    expect(screen.getByRole('table')).toBeInTheDocument();

    await screen.findByText('someFeature');
});

test('should show confirm dialog when reviving a toggle', async () => {
    render(<Component />);

    await screen.findByText('someFeature');

    const reviveButton = screen.getByTestId('revive-feature-toggle-button');
    fireEvent.click(reviveButton);

    await screen.findByText('Revive feature toggle');
});
