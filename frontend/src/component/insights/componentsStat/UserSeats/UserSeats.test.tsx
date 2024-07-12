import { testServerRoute, testServerSetup } from '../../../../utils/testServer';
import { screen } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import { UserSeats } from './UserSeats';

const server = testServerSetup();
const user1 = {};
const user2 = {};

const setupApiWithSeats = (seats: number | undefined) => {
    testServerRoute(server, '/api/admin/user-admin', {
        users: [user1, user2],
    });
    testServerRoute(server, '/api/instance/status', {
        plan: 'Enterprise',
        seats,
    });
    testServerRoute(server, '/api/admin/ui-config', {
        flags: {
            UNLEASH_CLOUD: true,
        },
    });
};

test('User seats display when seats are available', async () => {
    setupApiWithSeats(20);

    render(<UserSeats />);

    await screen.findByText('User seats');
    await screen.findByText('2/20 seats used');
});

test('User seats does not display when seats are not available', async () => {
    setupApiWithSeats(undefined);

    render(<UserSeats />);

    expect(screen.queryByText('User seats')).not.toBeInTheDocument();
});
