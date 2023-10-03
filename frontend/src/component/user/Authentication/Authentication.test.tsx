import Authentication from 'component/user/Authentication/Authentication';
import { screen } from '@testing-library/react';
import {
    LOGIN_PASSWORD_ID,
    LOGIN_EMAIL_ID,
    LOGIN_BUTTON,
    AUTH_PAGE_ID,
    SSO_LOGIN_BUTTON,
} from 'utils/testIds';
import React from 'react';
import { render } from 'utils/testRenderer';
import { testServerSetup, testServerRoute } from 'utils/testServer';

const server = testServerSetup();

test('should render password auth', async () => {
    testServerRoute(server, '*', {
        defaultHidden: false,
        message: 'You must sign in in order to use Unleash',
        path: '/auth/simple/login',
        type: 'password',
        options: [],
    });

    render(<Authentication redirect="/" />);

    await screen.findByTestId(AUTH_PAGE_ID);
    expect(screen.getByTestId(LOGIN_EMAIL_ID)).toBeInTheDocument();
    expect(screen.getByTestId(LOGIN_PASSWORD_ID)).toBeInTheDocument();
    expect(screen.getByTestId(LOGIN_BUTTON)).toBeInTheDocument();
});

test('should not render password auth if defaultHidden is true', async () => {
    testServerRoute(server, '*', {
        defaultHidden: true,
        message: 'You must sign in in order to use Unleash',
        path: '/auth/simple/login',
        type: 'password',
        options: [],
    });

    render(<Authentication redirect="/" />);

    await screen.findByTestId(AUTH_PAGE_ID);
    expect(screen.queryByTestId(LOGIN_EMAIL_ID)).not.toBeInTheDocument();
    expect(screen.queryByTestId(LOGIN_PASSWORD_ID)).not.toBeInTheDocument();
    expect(screen.queryByTestId(LOGIN_BUTTON)).not.toBeInTheDocument();
});

test('should render demo auth', async () => {
    testServerRoute(server, '*', {
        defaultHidden: false,
        message: 'You must sign in in order to use Unleash',
        path: '/auth/demo/login',
        type: 'demo',
        options: [],
    });

    render(<Authentication redirect="/" />);

    await screen.findByTestId(AUTH_PAGE_ID);
    expect(screen.getByTestId(LOGIN_EMAIL_ID)).toBeInTheDocument();
    expect(screen.queryByTestId(LOGIN_PASSWORD_ID)).not.toBeInTheDocument();
    expect(screen.getByTestId(LOGIN_BUTTON)).toBeInTheDocument();
});

test('should render email auth', async () => {
    testServerRoute(server, '*', {
        defaultHidden: false,
        message: 'You must sign in in order to use Unleash',
        path: '/auth/unsecure/login',
        type: 'unsecure',
        options: [],
    });

    render(<Authentication redirect="/" />);

    await screen.findByTestId(AUTH_PAGE_ID);
    expect(screen.getByTestId(LOGIN_EMAIL_ID)).toBeInTheDocument();
    expect(screen.queryByTestId(LOGIN_PASSWORD_ID)).not.toBeInTheDocument();
    expect(screen.getByTestId(LOGIN_BUTTON)).toBeInTheDocument();
});

test('should render Google auth', async () => {
    await testSSOAuthOption('google');
});

test('should render OIDC auth', async () => {
    await testSSOAuthOption('oidc');
});

test('should render SAML auth', async () => {
    await testSSOAuthOption('saml');
});

const testSSOAuthOption = async (authOption: string) => {
    const path = `/auth/${authOption}/login`;
    const testId = `${SSO_LOGIN_BUTTON}-${authOption}`;

    testServerRoute(server, '*', {
        defaultHidden: true,
        message: 'You must sign in in order to use Unleash',
        options: [{ type: authOption, message: '...', path: path }],
        path: '/auth/simple/login',
        type: 'password',
    });

    render(<Authentication redirect="/" />);

    const ssoLink = await screen.findByTestId(testId);
    expect(ssoLink.getAttribute('href')).toEqual(path);
    expect(screen.queryByTestId(LOGIN_EMAIL_ID)).not.toBeInTheDocument();
    expect(screen.queryByTestId(LOGIN_PASSWORD_ID)).not.toBeInTheDocument();
    expect(screen.queryByTestId(LOGIN_BUTTON)).not.toBeInTheDocument();
};
