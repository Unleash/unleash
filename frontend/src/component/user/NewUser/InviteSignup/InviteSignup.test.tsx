import { expect, test } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

test('sets a password for an invite link once the requirements are met', async () => {
    setup();
    testServerRoute(server, '/invite/valid-secret/validate', {});
    testServerRoute(server, '/auth/reset/validate', {
        name: INVALID_TOKEN_ERROR,
    });
    const { requests } = testServerRoute(
        server,
        '/invite/valid-secret/signup',
        {},
        'post',
        201,
    );

    testServerRoute(server, '/auth/reset/validate-password', {}, 'post');

    render(<InviteSignup />, { route: '/new-user?invite=valid-secret' });

    await userEvent.type(
        await screen.findByLabelText('Email'),
        'invitee@getunleash.io',
    );
    await userEvent.click(screen.getByText('Continue with email'));

    await screen.findByText('Set password');
    expect(screen.getByLabelText('Email')).toHaveValue('invitee@getunleash.io');
    const submit = screen.getByRole('button', { name: 'Customize Unleash' });

    await userEvent.type(screen.getByLabelText('Full name'), 'Invitee');
    await userEvent.type(screen.getByLabelText('Password'), 'weakpass');
    expect(submit).toBeDisabled();

    await userEvent.type(screen.getByLabelText('Password'), 'W0rd!');
    await waitFor(() => expect(submit).toBeEnabled());

    await userEvent.click(submit);

    await waitFor(() =>
        expect(requests).toEqual([
            {
                name: 'Invitee',
                email: 'invitee@getunleash.io',
                password: 'weakpassW0rd!',
            },
        ]),
    );
});

test('sets a password for a reset token without asking for a name', async () => {
    setup();
    testServerRoute(server, '/auth/reset/validate', {
        email: 'invitee@getunleash.io',
    });
    const { requests } = testServerRoute(
        server,
        '/auth/reset/password',
        {},
        'post',
    );

    testServerRoute(server, '/auth/reset/validate-password', {}, 'post');

    render(<InviteSignup />, { route: '/new-user?token=valid-token' });

    await screen.findByText("You've been invited to join Unleash");
    await userEvent.click(screen.getByText('Continue with email'));

    await screen.findByText('Set password');
    expect(screen.queryByLabelText('Full name')).not.toBeInTheDocument();

    await userEvent.type(screen.getByLabelText('Password'), 'Sup3r-secret');
    const submit = screen.getByRole('button', { name: 'Customize Unleash' });
    await waitFor(() => expect(submit).toBeEnabled());
    await userEvent.click(submit);

    await waitFor(() =>
        expect(requests).toEqual([
            { token: 'valid-token', password: 'Sup3r-secret' },
        ]),
    );
});
