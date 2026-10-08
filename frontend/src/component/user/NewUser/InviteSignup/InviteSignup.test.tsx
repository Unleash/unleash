import { expect, test } from 'vitest';
import { screen } from '@testing-library/react';
import { SSO_LOGIN_BUTTON } from 'utils/testIds';
import { InviteSignup } from './InviteSignup.tsx';
import { INVALID_TOKEN_ERROR } from 'hooks/api/getters/useResetPassword/useResetPassword';
import { testServerSetup, testServerRoute } from 'utils/testServer';
import { render } from 'utils/testRenderer';

const server = testServerSetup();

const setup = () => {
    testServerRoute(server, '/api/admin/ui-config', {});
    testServerRoute(server, '/api/admin/user', {
        type: 'password',
        defaultHidden: false,
        options: [
            {
                type: 'google',
                message: 'Continue with Google',
                path: '/auth/google/login',
            },
        ],
    });
};

test('shows the invite with sign-in options for the invited email', async () => {
    setup();
    testServerRoute(server, '/auth/reset/validate', {
        email: 'invitee@getunleash.io',
        createdBy: 'Vetle Tønnesen',
    });

    render(<InviteSignup />, { route: '/new-user?token=valid-token' });

    await screen.findByText('Vetle Tønnesen has invited you to join Unleash');
    expect(screen.getByLabelText('Email')).toHaveValue('invitee@getunleash.io');
    expect(
        screen.getByTestId(`${SSO_LOGIN_BUTTON}-google`),
    ).toBeInTheDocument();
});

test('does not show SSO options for an invite link', async () => {
    setup();
    testServerRoute(server, '/invite/valid-secret/validate', {});
    testServerRoute(server, '/auth/reset/validate', {
        name: INVALID_TOKEN_ERROR,
    });

    render(<InviteSignup />, { route: '/new-user?invite=valid-secret' });

    await screen.findByText("You've been invited to join Unleash");
    expect(
        screen.queryByTestId(`${SSO_LOGIN_BUTTON}-google`),
    ).not.toBeInTheDocument();
});
