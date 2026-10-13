import { renderHook, waitFor } from '@testing-library/react';
import { SWRConfig } from 'swr';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { useAuthEndpoint } from './useAuthEndpoint.js';

const user = { user: { id: 7, email: 'idle@getunleash.io' } };
const loginDetails = {
    type: 'password',
    path: '/auth/simple/login',
    message: 'You must sign in order to use Unleash',
    defaultHidden: false,
    options: [{ type: 'saml', message: 'Sign in with SAML 2.0', path: '/x' }],
};

const sessionEnded = {
    id: 'cafe',
    name: 'SessionEndedError',
    reason: 'idle',
    message:
        'Your session ended because you were inactive. Please log in again.',
};
const rateLimited = {
    id: 'f00d',
    name: 'RateLimitError',
    message: 'Too many requests',
};

let fetchMock: ReturnType<typeof vi.fn>;

const answerWith = (...bodies: unknown[]) => {
    fetchMock = vi.fn(() =>
        Promise.resolve({ json: () => Promise.resolve(bodies.shift()) }),
    );
    vi.stubGlobal('fetch', fetchMock);
};

const read = () =>
    renderHook(() => useAuthEndpoint(), {
        wrapper: ({ children }) => (
            <SWRConfig value={{ provider: () => new Map() }}>
                {children}
            </SWRConfig>
        ),
    });

beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
});

afterEach(() => {
    vi.unstubAllGlobals();
});

test('reads the signed-in user', async () => {
    answerWith(user);

    const { result } = read();

    await waitFor(() => expect(result.current.data).toEqual(user));
    expect(fetchMock).toHaveBeenCalledTimes(1);
});

test('reads the login details', async () => {
    answerWith(loginDetails);

    const { result } = read();

    await waitFor(() => expect(result.current.data).toEqual(loginDetails));
    expect(fetchMock).toHaveBeenCalledTimes(1);
});

test('asks again after a policy sign-out', async () => {
    // caching the error would leave the login page with no provider to offer,
    // so the user lands on an empty page after being signed out
    answerWith(sessionEnded, loginDetails);

    const { result } = read();

    await waitFor(() => expect(result.current.data).toEqual(loginDetails));
    expect(fetchMock).toHaveBeenCalledTimes(2);
});

test('reports any other error instead of retrying it', async () => {
    // only a sign-out leaves a second read able to answer. Asking again for
    // anything else would read the next response as an auth state
    answerWith(rateLimited, loginDetails);

    const { result } = read();

    await waitFor(() => expect(result.current.error).toBeInstanceOf(Error));
    expect(result.current.data).toBeUndefined();
    expect(fetchMock).toHaveBeenCalledTimes(1);
});
