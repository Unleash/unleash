import { expect, test } from 'vitest';
import { screen } from '@testing-library/react';
import { SSO_LOGIN_BUTTON } from 'utils/testIds';
import { InviteSignup } from './InviteSignup.tsx';
import { INVALID_TOKEN_ERROR } from 'hooks/api/getters/useResetPassword/useResetPassword';
import { testServerSetup, testServerRoute } from 'utils/testServer';
import { render } from 'utils/testRenderer';

const server = testServerSetup();

const ssoOptions = [
    {
        type: 'google',
        message: 'Continue with Google',
        path: '/auth/google/login',
    },
    {
        type: 'github',
        message: 'Continue with GitHub',
        path: '/auth/github/login',
    },
];

const setup = ({ defaultHidden = false } = {}) => {
    testServerRoute(server, '/api/admin/ui-config', {});
    testServerRoute(server, '/api/admin/user', {
        type: 'password',
        path: '/auth/simple/login',
        message: 'You must sign in in order to use Unleash',
        defaultHidden,
        options: ssoOptions,
    });
};

test('shows who invited you, the instance and the invited email', async () => {
    setup();
    testServerRoute(server, '/auth/reset/validate', {
        email: 'invitee@getunleash.io',
        createdBy: 'Vetle Tønnesen',
    });

    render(<InviteSignup />, { route: '/new-user?token=valid-token' });

    await screen.findByText('Vetle Tønnesen has invited you to join Unleash');
    expect(
        screen.getByText('Continue with invitee@getunleash.io to join'),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toHaveValue('invitee@getunleash.io');
    expect(
        screen.getByTestId(`${SSO_LOGIN_BUTTON}-google`),
    ).toBeInTheDocument();
    expect(
        screen.getByTestId(`${SSO_LOGIN_BUTTON}-github`),
    ).toBeInTheDocument();
    expect(screen.getByText('OR')).toBeInTheDocument();
    expect(
        screen.getByRole('button', { name: 'Continue with email' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Sign in' })).toHaveAttribute(
        'href',
        '/login',
    );
});

test('hides the email option when password login is disabled', async () => {
    setup({ defaultHidden: true });
    testServerRoute(server, '/auth/reset/validate', {
        email: 'invitee@getunleash.io',
        createdBy: 'Vetle Tønnesen',
    });

    render(<InviteSignup />, { route: '/new-user?token=valid-token' });

    await screen.findByTestId(`${SSO_LOGIN_BUTTON}-google`);
    expect(screen.queryByLabelText('Email')).not.toBeInTheDocument();
    expect(screen.queryByText('OR')).not.toBeInTheDocument();
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
    expect(screen.getByLabelText('Email')).toHaveValue('');
});
