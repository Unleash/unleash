import { expect, test } from 'vitest';
import { render, settleProviders } from 'utils/testRenderer';
import { screen } from '@testing-library/react';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import { useAdminRoutes } from './useAdminRoutes.js';

const server = testServerSetup();

const AdminRoutesProbe = () => {
    const paths = useAdminRoutes().map((r) => r.path);
    return (
        <ul>
            {paths.map((p) => (
                <li key={p}>{p}</li>
            ))}
        </ul>
    );
};

test('/admin/instance-name is hidden outside cloud (self-hosted enterprise and OSS)', async () => {
    testServerRoute(server, '/api/admin/ui-config', {
        flags: { UNLEASH_CLOUD: false, editableInstanceName: true },
    });
    testServerRoute(server, '/api/instance/status', {});

    render(<AdminRoutesProbe />);
    await settleProviders();

    expect(screen.queryByText('/admin/instance-name')).not.toBeInTheDocument();
});

test('/admin/instance-name is visible on cloud when the feature flag is enabled', async () => {
    testServerRoute(server, '/api/admin/ui-config', {
        flags: { UNLEASH_CLOUD: true, editableInstanceName: true },
    });
    testServerRoute(server, '/api/instance/status', {});

    render(<AdminRoutesProbe />);

    expect(await screen.findByText('/admin/instance-name')).toBeInTheDocument();
});
