import { screen } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import { UsersHeader } from './UsersHeader.tsx';
import { testServerRoute, testServerSetup } from 'utils/testServer';

describe('UsersHeader', () => {
    const server = testServerSetup();

    test('should show LicensedUsersBox for enterprise customers that are not PAYG', async () => {
        testServerRoute(server, '/api/admin/ui-config', {
            environment: 'enterprise',
            versionInfo: {
                current: { enterprise: '1.0.0' },
            },
            billing: 'enterprise',
        });

        render(<UsersHeader />);

        expect(
            await screen.findByText('Seats used over the last 30 days'),
        ).toBeInTheDocument();
    });

    test('should not show LicensedUsersBox for enterprise customers with PAYG billing', async () => {
        testServerRoute(server, '/api/admin/ui-config', {
            environment: 'enterprise',
            versionInfo: {
                current: { enterprise: '1.0.0' },
            },
            billing: 'pay-as-you-go',
        });

        render(<UsersHeader />);

        expect(
            screen.queryByText('Seats used over the last 30 days'),
        ).not.toBeInTheDocument();
    });

    test('should not show LicensedUsersBox for Pro customers', async () => {
        testServerRoute(server, '/api/admin/ui-config', {
            environment: 'pro',
            versionInfo: {
                current: {},
            },
            billing: 'pro',
        });

        render(<UsersHeader />);

        expect(
            screen.queryByText('Seats used over the last 30 days'),
        ).not.toBeInTheDocument();
    });

    test('should not show LicensedUsersBox for OSS users', async () => {
        testServerRoute(server, '/api/admin/ui-config', {
            environment: 'OSS',
            versionInfo: {
                current: {},
            },
        });

        render(<UsersHeader />);

        expect(
            screen.queryByText('Seats used over the last 30 days'),
        ).not.toBeInTheDocument();
    });
});
