import { render } from 'utils/testRenderer';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ToastRenderer from 'component/common/ToastRenderer/ToastRenderer';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import PasswordAuth from './PasswordAuth.tsx';
import { LOGIN_BUTTON } from 'utils/testIds';
import type { IAuthEndpointDetailsResponse } from '../../hooks/api/getters/useAuth/useAuthEndpoint.ts';
import HostedAuth from './HostedAuth.tsx';

const server = testServerSetup();

const setupApi = () => {
    testServerRoute(
        server,
        '/api/admin/auth',
        {
            deletedSessions: 1,
            activeSessions: 3,
        },
        'post',
        200,
    );
};

test('should show deleted stale sessions info for Password Auth', async () => {
    setupApi();
    render(
        <>
            <ToastRenderer />
            <PasswordAuth
                authDetails={
                    { path: '/api/admin/auth' } as IAuthEndpointDetailsResponse
                }
                redirect={''}
            />
        </>,
    );
    const login = screen.getByLabelText('Username or email');
    await userEvent.type(login, 'user@getunleash.io');

    const password = screen.getByLabelText('Password');
    await userEvent.type(password, 'password');

    const button = screen.getByTestId(LOGIN_BUTTON);

    button.click();

    await screen.findByText('Maximum session limit of 3 reached');
});

test('should show deleted stale sessions info for Hosted Auth', async () => {
    setupApi();
    render(
        <>
            <ToastRenderer />
            <HostedAuth
                authDetails={
                    { path: '/api/admin/auth' } as IAuthEndpointDetailsResponse
                }
                redirect={''}
            />
        </>,
    );
    const login = screen.getByLabelText('Username or email');
    await userEvent.type(login, 'user@getunleash.io');

    const password = screen.getByLabelText('Password');
    await userEvent.type(password, 'password');

    const button = screen.getByTestId(LOGIN_BUTTON);

    button.click();

    await screen.findByText('Maximum session limit of 3 reached');
});
