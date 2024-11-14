import { testServerRoute, testServerSetup } from '../../../../utils/testServer';
import { screen } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import { UserSeats } from './UserSeats';

const server = testServerSetup();
const user1 = {};
const user2 = {};

const setupApi = () => {
    testServerRoute(server, '/api/admin/user-admin', {
        users: [user1, user2],
    });
    testServerRoute(server, '/api/admin/ui-config', {
        flags: {
            UNLEASH_CLOUD: true,
        },
    });
};

test('User seats display when seats are available', async () => {
    setupApi();

    render(<UserSeats />);

    await screen.findByText('User seats');
    await screen.findByText('2/5 seats used');
});
