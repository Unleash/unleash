import '@testing-library/jest-dom/vitest';
import { afterEach, beforeEach, expect, test } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from 'utils/testRenderer';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import { http, HttpResponse } from 'msw';
import { mutate, useSWRConfig } from 'swr';
import { ThemeProvider } from 'themes/ThemeProvider';
import { USER_ENDPOINT_PATH } from 'hooks/api/getters/useAuth/useAuthEndpoint';
import { useAuthSplash } from 'hooks/api/getters/useAuth/useAuthSplash';
import { IntroProvider } from 'component/onboarding/intro/IntroProvider.tsx';
import { NewToUnleashBanner } from './NewToUnleashBanner.tsx';

const server = testServerSetup();
beforeEach(() => {
    testServerRoute(server, '/api/admin/user', {
        user: { id: 1 },
        permissions: [],
        feedback: [],
        splash: {},
    });
});

afterEach(() => mutate(USER_ENDPOINT_PATH, undefined, { revalidate: false }));

const SplashStatus = () => {
    const { splash, error } = useAuthSplash();
    if (error) return <span>Splash failed</span>;
    if (!splash) return <span>Splash unavailable</span>;
    return (
        <span>
            {splash['new-to-unleash-banner']
                ? 'Splash dismissed'
                : 'Splash loaded'}
        </span>
    );
};

test('offers an introduction and resources without assuming a role or offering flag creation', async () => {
    render(<NewToUnleashBanner />);

    expect(
        await screen.findByRole('region', { name: 'New to Unleash?' }),
    ).toBeInTheDocument();
    expect(
        screen.getByRole('button', { name: 'Intro tour' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Go to docs' })).toHaveAttribute(
        'href',
        'https://docs.getunleash.io/',
    );
    expect(
        screen.getByRole('link', { name: 'View architecture' }),
    ).toHaveAttribute(
        'href',
        'https://docs.getunleash.io/get-started/unleash-overview',
    );
    for (const link of screen.getAllByRole('link')) {
        expect(link).toHaveAttribute('target', '_blank');
        expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    }
    expect(
        screen.queryByText(/viewer|create flag|setup prompt/i),
    ).not.toBeInTheDocument();
});

test('hides the banner when the current user has already dismissed it', async () => {
    testServerRoute(server, '/api/admin/user', {
        user: { id: 1 },
        splash: { 'new-to-unleash-banner': true },
    });
    render(
        <>
            <NewToUnleashBanner />
            <SplashStatus />
        </>,
    );

    await screen.findByText('Splash dismissed');
    expect(
        screen.queryByRole('region', { name: 'New to Unleash?' }),
    ).not.toBeInTheDocument();
});

test('remembers dismissal in the shared splash cache', async () => {
    let finishSaving: () => void = () => {};
    const saving = new Promise<void>((resolve) => {
        finishSaving = resolve;
    });
    server.use(
        http.post('/api/admin/splash/new-to-unleash-banner', async () => {
            await saving;
            testServerRoute(server, '/api/admin/user', {
                user: { id: 1 },
                splash: { 'new-to-unleash-banner': true },
            });
            return HttpResponse.json({ seen: true });
        }),
    );
    const { rerender } = render(
        <>
            <NewToUnleashBanner key='first' />
            <SplashStatus />
        </>,
        { wrapper: ThemeProvider },
    );

    await userEvent.click(
        await screen.findByRole('button', { name: 'Dismiss' }),
    );
    expect(
        screen.queryByRole('region', { name: 'New to Unleash?' }),
    ).not.toBeInTheDocument();
    expect(screen.getByText('Splash loaded')).toBeInTheDocument();

    finishSaving();
    await screen.findByText('Splash dismissed');
    rerender(
        <>
            <NewToUnleashBanner key='second' />
            <SplashStatus />
        </>,
    );
    expect(
        screen.queryByRole('region', { name: 'New to Unleash?' }),
    ).not.toBeInTheDocument();
});

test('waits for splash data before showing the banner', async () => {
    let release: () => void = () => {};
    const responseReady = new Promise<void>((resolve) => {
        release = resolve;
    });
    server.use(
        http.get('/api/admin/user', async () => {
            await responseReady;
            return HttpResponse.json({ user: { id: 1 }, splash: {} });
        }),
    );
    render(<NewToUnleashBanner />);
    expect(
        screen.queryByRole('region', { name: 'New to Unleash?' }),
    ).not.toBeInTheDocument();

    release();
    expect(
        await screen.findByRole('region', { name: 'New to Unleash?' }),
    ).toBeInTheDocument();
});

test.each([
    ['cannot be loaded', () => HttpResponse.error(), 'Splash failed'],
    [
        'is unavailable',
        () => HttpResponse.json({ type: 'password' }),
        'Splash unavailable',
    ],
])('stays hidden when splash data %s', async (_name, response, status) => {
    server.use(http.get('/api/admin/user', response));
    render(
        <>
            <NewToUnleashBanner />
            <SplashStatus />
        </>,
    );
    await screen.findByText(status);
    expect(
        screen.queryByRole('region', { name: 'New to Unleash?' }),
    ).not.toBeInTheDocument();
});

test('keeps the banner visible when refreshing previously loaded splash data fails', async () => {
    const RefreshSplash = () => {
        const { mutate } = useSWRConfig();
        return (
            <button
                type='button'
                onClick={() => mutate(USER_ENDPOINT_PATH).catch(console.warn)}
            >
                Refresh splash
            </button>
        );
    };
    render(
        <>
            <NewToUnleashBanner />
            <SplashStatus />
            <RefreshSplash />
        </>,
    );
    expect(
        await screen.findByRole('region', { name: 'New to Unleash?' }),
    ).toBeInTheDocument();

    server.use(http.get('/api/admin/user', () => HttpResponse.error()));
    await userEvent.click(
        screen.getByRole('button', { name: 'Refresh splash' }),
    );
    await screen.findByText('Splash failed');
    expect(
        screen.queryByRole('region', { name: 'New to Unleash?' }),
    ).toBeInTheDocument();
});

test('opens the existing Unleash intro tour', async () => {
    render(
        <IntroProvider>
            <NewToUnleashBanner />
        </IntroProvider>,
    );
    await userEvent.click(
        await screen.findByRole('button', { name: 'Intro tour' }),
    );
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
});
