import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { SWRConfig } from 'swr';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import { setLocalStorageItem } from 'utils/storage';
import { InitialRedirect } from './InitialRedirect';

// Keys match createLocalStorage internals with basePath='' (jsdom has no meta tag)
const LAST_VIEWED_PAGE_KEY = ':lastViewedPage:localStorage:v2';
const LAST_VIEWED_PROJECT_KEY = ':unleash-lastViewedProject';

const LocationDisplay = () => {
    const { pathname } = useLocation();
    return <div data-testid='location'>{pathname}</div>;
};

const server = testServerSetup();

const setupLoggedIn = () => {
    testServerRoute(server, '/api/admin/user', {
        user: { id: 1, name: 'Test User', email: 'test@test.com' },
        permissions: [],
        feedback: [],
        splash: {},
    });
    testServerRoute(server, '/api/admin/projects', { projects: [] });
};

const setupLoggedOut = () => {
    testServerRoute(server, '/api/admin/user', {
        type: 'password',
        path: '/auth/simple/login',
        message: '',
        defaultHidden: false,
        options: [],
    });
    testServerRoute(server, '/api/admin/projects', { projects: [] });
};

const renderInitialRedirect = () =>
    render(
        <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>
            <MemoryRouter initialEntries={['/']}>
                <Routes>
                    <Route path='/' element={<InitialRedirect />} />
                    <Route path='*' element={<LocationDisplay />} />
                </Routes>
            </MemoryRouter>
        </SWRConfig>,
    );

beforeEach(() => {
    localStorage.clear();
});

test('redirects to /personal when no last viewed page is stored', async () => {
    setupLoggedIn();
    renderInitialRedirect();

    await waitFor(() => {
        expect(screen.getByTestId('location')).toHaveTextContent('/personal');
    });
});

test('redirects to the last viewed top-level page stored in localStorage', async () => {
    setLocalStorageItem(LAST_VIEWED_PAGE_KEY, '/playground');
    setupLoggedIn();
    renderInitialRedirect();

    await waitFor(() => {
        expect(screen.getByTestId('location')).toHaveTextContent('/playground');
    });
});

test('redirects to the last visited project when lastViewedPage is /projects', async () => {
    setLocalStorageItem(LAST_VIEWED_PAGE_KEY, '/projects');
    setLocalStorageItem(LAST_VIEWED_PROJECT_KEY, 'my-project');
    setupLoggedIn();
    renderInitialRedirect();

    await waitFor(() => {
        expect(screen.getByTestId('location')).toHaveTextContent(
            '/projects/my-project',
        );
    });
});

test('falls back to /projects (not the sub-project) when no last project is recorded', async () => {
    setLocalStorageItem(LAST_VIEWED_PAGE_KEY, '/projects');
    setupLoggedIn();
    renderInitialRedirect();

    await waitFor(() => {
        expect(screen.getByTestId('location')).toHaveTextContent('/projects');
    });
});

test('redirects to /login when the user is not authenticated', async () => {
    setupLoggedOut();
    renderInitialRedirect();

    await waitFor(() => {
        expect(screen.getByTestId('location')).toHaveTextContent('/login');
    });
});

test('localStorage persists independently of sessionStorage (remembers page across session expiry)', async () => {
    // Simulates the "session expires but localStorage survives" scenario:
    // user visited /search, session was cleared, but localStorage still holds the page
    setLocalStorageItem(LAST_VIEWED_PAGE_KEY, '/search');
    sessionStorage.clear();
    setupLoggedIn();
    renderInitialRedirect();

    await waitFor(() => {
        expect(screen.getByTestId('location')).toHaveTextContent('/search');
    });
});
