import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, test, vi } from 'vitest';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router';
import Login from './Login.tsx';
import Authentication from '../Authentication/Authentication.tsx';
import { LoginRedirect } from 'component/common/LoginRedirect/LoginRedirect';
import { getSessionStorageItem, setSessionStorageItem } from 'utils/storage';

vi.mock('hooks/api/getters/useAuth/useAuthUser', () => ({
    useAuthUser: () => ({ user: { id: 1, name: 'Synthetic user' } }),
}));
vi.mock('hooks/api/getters/useAuth/useAuthDetails', () => ({
    useAuthDetails: () => ({ authDetails: undefined }),
}));

const Location = () => {
    const { pathname, search } = useLocation();
    return <div data-testid='location'>{pathname + search}</div>;
};

afterEach(() => {
    cleanup();
    window.sessionStorage.clear();
});

const destinations = [
    '/search?query=C%23',
    '/search?query=a%26b&sortBy=name',
    '/search?query=c%2B%2B',
    '/search?query=100%25',
    '/search?query=%E2%9C%93',
    '/projects/a%2Fb?query=C%23',
    '/projects/100%25?x=y',
];

test.each(
    destinations,
)('preserves %s through the login redirect round trip', async (destination) => {
    const producer = render(
        <MemoryRouter initialEntries={[destination]}>
            <Routes>
                <Route path='/login' element={<Location />} />
                <Route path='*' element={<LoginRedirect />} />
            </Routes>
        </MemoryRouter>,
    );
    const loginLocation = (await screen.findByTestId('location')).textContent!;
    expect(loginLocation).toBe(
        `/login?redirect=${encodeURIComponent(destination)}`,
    );
    producer.unmount();

    render(
        <MemoryRouter initialEntries={[loginLocation]}>
            <Routes>
                <Route path='/login' element={<Login />} />
                <Route path='*' element={<Location />} />
            </Routes>
        </MemoryRouter>,
    );
    expect((await screen.findByTestId('location')).textContent).toBe(
        destination,
    );
});

test.each(
    destinations,
)('preserves the stored redirect %s after authentication', async (destination) => {
    const authentication = render(
        <MemoryRouter>
            <Authentication redirect={destination} />
        </MemoryRouter>,
    );
    expect(getSessionStorageItem('login-redirect')).toBe(destination);
    authentication.unmount();
    render(
        <MemoryRouter initialEntries={['/login']}>
            <Routes>
                <Route path='/login' element={<Login />} />
                <Route path='*' element={<Location />} />
            </Routes>
        </MemoryRouter>,
    );
    expect((await screen.findByTestId('location')).textContent).toBe(
        destination,
    );
    expect(getSessionStorageItem('login-redirect')).toBeUndefined();
});

test('uses the explicit query redirect ahead of session storage', async () => {
    setSessionStorageItem('login-redirect', '/stored');
    render(
        <MemoryRouter initialEntries={['/login?redirect=%2Fexplicit%3Fa%3D1']}>
            <Routes>
                <Route path='/login' element={<Login />} />
                <Route path='*' element={<Location />} />
            </Routes>
        </MemoryRouter>,
    );
    expect((await screen.findByTestId('location')).textContent).toBe(
        '/explicit?a=1',
    );
});

test('falls back to the root when there is no redirect', async () => {
    render(
        <MemoryRouter initialEntries={['/login']}>
            <Routes>
                <Route path='/login' element={<Login />} />
                <Route path='*' element={<Location />} />
            </Routes>
        </MemoryRouter>,
    );
    expect((await screen.findByTestId('location')).textContent).toBe('/');
});
