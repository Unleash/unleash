import { expect, test } from 'vitest';
import { screen } from '@testing-library/react';
import { SSO_LOGIN_BUTTON } from 'utils/testIds';
import { NewUser } from './NewUser.tsx';
import { INVALID_TOKEN_ERROR } from 'hooks/api/getters/useResetPassword/useResetPassword';
import { testServerSetup, testServerRoute } from 'utils/testServer';
import { render } from 'utils/testRenderer';

const server = testServerSetup();

const ssoOptions = [
    { type: 'oidc', message: 'Sign in with Google', path: '/auth/oidc/login' },
    {
        type: 'github',
        message: 'Sign in with GitHub',
        path: '/auth/github/login',
    },
];

const setupAuthDetails = ({
    defaultHidden = false,
    options = ssoOptions,
}: {
    defaultHidden?: boolean;
    options?: typeof ssoOptions;
} = {}) => {
    testServerRoute(server, '/api/admin/ui-config', {});
    testServerRoute(server, '/api/admin/user', {
        type: 'password',
        path: '/auth/simple/login',
        message: 'You must sign in in order to use Unleash',
        defaultHidden,
        options,
    });
};

const setupValidInvite = () => {
    testServerRoute(server, '/invite/valid-secret/validate', {});
    testServerRoute(server, '/auth/reset/validate', {
        name: INVALID_TOKEN_ERROR,
    });
};

test('should not render SSO options when signing up with an invite link', async () => {
    setupAuthDetails();
    setupValidInvite();

    render(<NewUser />, { route: '/new-user?invite=valid-secret' });

    await screen.findByLabelText(/Full name/);
    expect(
        screen.queryByTestId(`${SSO_LOGIN_BUTTON}-oidc`),
    ).not.toBeInTheDocument();
    expect(
        screen.queryByTestId(`${SSO_LOGIN_BUTTON}-github`),
    ).not.toBeInTheDocument();
    expect(
        screen.queryByText('or sign-up with an email address'),
    ).not.toBeInTheDocument();
});

test('should render SSO options for an invite link when password auth is hidden', async () => {
    setupAuthDetails({ defaultHidden: true });
    setupValidInvite();

    render(<NewUser />, { route: '/new-user?invite=valid-secret' });

    await screen.findByTestId(`${SSO_LOGIN_BUTTON}-oidc`);
    expect(screen.queryByLabelText(/Full name/)).not.toBeInTheDocument();
});

test('should not render SSO options for an invite link when no SSO is configured', async () => {
    setupAuthDetails({ options: [] });
    setupValidInvite();

    render(<NewUser />, { route: '/new-user?invite=valid-secret' });

    await screen.findByLabelText(/Full name/);
    expect(
        screen.queryByTestId(`${SSO_LOGIN_BUTTON}-oidc`),
    ).not.toBeInTheDocument();
});

test('should render SSO options when resetting a password', async () => {
    setupAuthDetails();
    testServerRoute(server, '/auth/reset/validate', {
        email: 'user@getunleash.io',
    });

    render(<NewUser />, { route: '/new-user?token=valid-token' });

    await screen.findByTestId(`${SSO_LOGIN_BUTTON}-oidc`);
    expect(
        screen.getByTestId(`${SSO_LOGIN_BUTTON}-github`),
    ).toBeInTheDocument();
});
