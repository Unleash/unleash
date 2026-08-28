import { screen } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import { expect, test } from 'vitest';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import { ReleaseManagement } from './ReleaseManagement.tsx';

const server = testServerSetup();

test('renders the global release templates', async () => {
    testServerRoute(server, '/api/admin/ui-config', {
        versionInfo: { current: { enterprise: '1.0.0' } },
    });
    testServerRoute(server, '/api/admin/release-plan-templates', [
        { id: '1', name: 'Global template 1' },
        { id: '2', name: 'Global template 2' },
    ]);

    render(<ReleaseManagement />);

    expect(await screen.findByText('Global template 1')).toBeInTheDocument();
    expect(screen.getByText('Global template 2')).toBeInTheDocument();
});
