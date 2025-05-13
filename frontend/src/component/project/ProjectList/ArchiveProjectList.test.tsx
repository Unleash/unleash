import { screen, waitFor } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import { ArchiveProjectList } from './ArchiveProjectList.tsx';
import userEvent from '@testing-library/user-event';

const server = testServerSetup();

const setupApi = () => {
    testServerRoute(server, '/api/admin/projects', {
        projects: [
            { id: 'testid-1', name: 'Project One', archived: true },
            { id: 'testid-2', name: 'Project Two', archived: true },
        ],
    });

    testServerRoute(server, '/api/admin/ui-config', {
        flags: {
            archiveFeature: true,
        },
        versionInfo: {
            current: { enterprise: 'version' },
        },
    });
};

beforeEach(() => {
    setupApi();
});

test('displays archived projects correctly', async () => {
    render(<ArchiveProjectList />);

    await waitFor(() => {
        expect(screen.getByText('Project One')).toBeInTheDocument();
        expect(screen.getByText('Project Two')).toBeInTheDocument();
    });
});

test('search in header works', async () => {
    render(<ArchiveProjectList />);

    const searchInput = screen.getByPlaceholderText(/^Search/);
    expect(searchInput).toBeInTheDocument();

    await userEvent.type(searchInput, 'One');

    await waitFor(() => {
        expect(screen.queryByTestId('testid-1')).toBeInTheDocument();
        expect(screen.queryByTestId('testid-2')).not.toBeInTheDocument();
    });
});
