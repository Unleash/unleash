import { screen } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import { BulkEnableDialog } from './BulkEnableDialog';
import { testServerRoute, testServerSetup } from 'utils/testServer';

const server = testServerSetup();

test('should render bulk enable dialog in regular mode', async () => {
    testServerRoute(server, '/api/admin/ui-config', {});
    testServerRoute(server, '/api/admin/projects/project1', {});

    const defaultProps = {
        showExportDialog: true,
        data: [
            {
                name: 'feature1',
                environments: [
                    { name: 'env1', enabled: true },
                    { name: 'env2', enabled: false },
                ],
            },
        ],
        onClose: () => {},
        onConfirm: () => {},
        environments: ['env1', 'env2'],
        projectId: 'project1',
    };

    render(<BulkEnableDialog {...defaultProps} />);

    expect(screen.getByText('Enable feature toggles')).toBeInTheDocument();
    expect(screen.getByText('env1')).toBeInTheDocument();
    expect(
        screen.getByText('1 feature toggle is already enabled.')
    ).toBeInTheDocument();
    expect(
        screen.queryByText('Change requests are enabled for this environment.')
    ).not.toBeInTheDocument();
    expect(screen.getByText('Enable toggles')).toBeInTheDocument();
});

test('should render bulk enable dialog in change request mode', async () => {
    testServerRoute(server, '/api/admin/ui-config', {
        environment: 'Open Source',
        versionInfo: {
            current: { oss: 'irrelevant', enterprise: 'some value' },
        },
    });
    testServerRoute(server, '/api/admin/projects/project1', {});
    testServerRoute(
        server,
        '/api/admin/projects/project1/change-requests/config',
        [
            {
                environment: 'env1',
                type: 'development',
                changeRequestEnabled: true,
            },
            {
                environment: 'env2',
                type: 'production',
                changeRequestEnabled: true,
            },
        ]
    );

    const defaultProps = {
        showExportDialog: true,
        data: [
            {
                name: 'feature1',
                environments: [
                    { name: 'env1', enabled: true },
                    { name: 'env2', enabled: false },
                ],
            },
            {
                name: 'feature2',
                environments: [
                    { name: 'env1', enabled: true },
                    { name: 'env2', enabled: false },
                ],
            },
            {
                name: 'feature3',
                environments: [
                    { name: 'env1', enabled: false },
                    { name: 'env2', enabled: false },
                ],
            },
        ],
        onClose: () => {},
        onConfirm: () => {},
        environments: ['env1', 'env2'],
        projectId: 'project1',
    };

    render(<BulkEnableDialog {...defaultProps} />);

    await screen.findByText(
        'Change requests are enabled for this environment.'
    );
    await screen.findByText('3');

    expect(screen.getByText('Enable feature toggles')).toBeInTheDocument();
    expect(screen.getByText('env1')).toBeInTheDocument();
    expect(
        screen.getByText('2 feature toggles are already enabled.')
    ).toBeInTheDocument();
    expect(screen.getByText('Add to change request')).toBeInTheDocument();
});
