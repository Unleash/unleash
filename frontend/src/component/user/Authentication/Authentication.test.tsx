import { expect, test } from 'vitest';
import Authentication from 'component/user/Authentication/Authentication';
import { screen } from '@testing-library/react';
import {
    LOGIN_PASSWORD_ID,
    LOGIN_EMAIL_ID,
    LOGIN_BUTTON,
    AUTH_PAGE_ID,
    SSO_LOGIN_BUTTON,
} from 'utils/testIds';
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

    render(<Authentication redirect='/' />);

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

    render(<Authentication redirect='/' />);

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

    render(<Authentication redirect='/' />);

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

    render(<Authentication redirect='/' />);

    await screen.findByTestId(AUTH_PAGE_ID);
    expect(screen.getByTestId(LOGIN_EMAIL_ID)).toBeInTheDocument();
    expect(screen.queryByTestId(LOGIN_PASSWORD_ID)).not.toBeInTheDocument();
    expect(screen.getByTestId(LOGIN_BUTTON)).toBeInTheDocument();
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

    render(<Authentication redirect='/' />);

    const ssoLink = await screen.findByTestId(testId);
    expect(ssoLink.getAttribute('href')).toEqual(path);
    expect(screen.queryByTestId(LOGIN_EMAIL_ID)).not.toBeInTheDocument();
    expect(screen.queryByTestId(LOGIN_PASSWORD_ID)).not.toBeInTheDocument();
    expect(screen.queryByTestId(LOGIN_BUTTON)).not.toBeInTheDocument();
};

test('maps a code from the server to our own wording', async () => {
    testServerRoute(server, '*', {
        defaultHidden: false,
        message: 'You must sign in in order to use Unleash',
        path: '/auth/simple/login',
        type: 'password',
        options: [],
    });

    render(<Authentication redirect='/' />, {
        route: '/login?errorMsg=oidc_not_enabled',
    });

    expect(
        await screen.findByText('OpenID Connect is not enabled'),
    ).toBeInTheDocument();
});

test('shows a message it has no code for as it came', async () => {
    testServerRoute(server, '*', {
        defaultHidden: false,
        message: 'You must sign in in order to use Unleash',
        path: '/auth/simple/login',
        type: 'password',
        options: [],
    });

    // what oidc-provider sends on main and feat/step-up-auth
    render(<Authentication redirect='/' />, {
        route: '/login?errorMsg=OpenID%20Connect%20is%20not%20enabled',
    });

    expect(
        await screen.findByText('OpenID Connect is not enabled'),
    ).toBeInTheDocument();
});

test('an inherited key is text, not a lookup that breaks the page', async () => {
    testServerRoute(server, '*', {
        defaultHidden: false,
        message: 'You must sign in in order to use Unleash',
        path: '/auth/simple/login',
        type: 'password',
        options: [],
    });

    render(<Authentication redirect='/' />, {
        route: '/login?errorMsg=__proto__',
    });

    expect(await screen.findByTestId(AUTH_PAGE_ID)).toBeInTheDocument();
    expect(screen.getByText('__proto__')).toBeInTheDocument();
    expect(screen.getByTestId(LOGIN_EMAIL_ID)).toBeInTheDocument();
});
