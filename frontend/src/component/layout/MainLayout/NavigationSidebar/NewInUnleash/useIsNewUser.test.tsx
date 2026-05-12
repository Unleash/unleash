import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SWRConfig } from 'swr';
import type { FC, ReactNode } from 'react';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import { useIsNewUser } from './useIsNewUser.ts';

const NOW = new Date('2026-05-12T12:00:00.000Z');
const DAY_MS = 24 * 60 * 60 * 1000;

const server = testServerSetup();

const Wrapper: FC<{ children: ReactNode }> = ({ children }) => (
    <SWRConfig value={{ provider: () => new Map() }}>{children}</SWRConfig>
);

const TestComponent: FC = () => {
    const isNewUser = useIsNewUser();
    return <div>{isNewUser ? 'new' : 'established'}</div>;
};

const mockUser = (createdAt: string | null, id = 5) =>
    testServerRoute(server, '/api/admin/user', {
        user: createdAt ? { id, createdAt } : { id },
        feedback: [],
        permissions: [],
        splash: {},
    });

const mockActivityCount = (total: number) =>
    testServerRoute(server, '/api/admin/search/events', { events: [], total });

const daysAgo = (days: number) =>
    new Date(NOW.getTime() - days * DAY_MS).toISOString();

beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.setSystemTime(NOW);
});

afterEach(() => {
    vi.useRealTimers();
});

test('treats user with no createdAt as established (skips check)', async () => {
    mockUser(null);
    mockActivityCount(0);
    render(<TestComponent />, { wrapper: Wrapper });
    expect(await screen.findByText('established')).toBeInTheDocument();
});

test('treats malformed createdAt as established', async () => {
    mockUser('not-a-date');
    mockActivityCount(0);
    render(<TestComponent />, { wrapper: Wrapper });
    expect(await screen.findByText('established')).toBeInTheDocument();
});

test('tenure under 7 days returns new regardless of activity', async () => {
    mockUser(daysAgo(3));
    mockActivityCount(99);
    render(<TestComponent />, { wrapper: Wrapper });
    expect(await screen.findByText('new')).toBeInTheDocument();
});

test('tenure exactly at the 7-day boundary triggers the activity check', async () => {
    mockUser(daysAgo(7));
    mockActivityCount(0);
    render(<TestComponent />, { wrapper: Wrapper });
    expect(await screen.findByText('new')).toBeInTheDocument();
});

test('tenure between 7 and 14 days with no activity returns new', async () => {
    mockUser(daysAgo(10));
    mockActivityCount(0);
    render(<TestComponent />, { wrapper: Wrapper });
    expect(await screen.findByText('new')).toBeInTheDocument();
});

test('tenure between 7 and 14 days with one activity event still returns new', async () => {
    mockUser(daysAgo(10));
    mockActivityCount(1);
    render(<TestComponent />, { wrapper: Wrapper });
    expect(await screen.findByText('new')).toBeInTheDocument();
});

test('tenure between 7 and 14 days with two or more activity events returns established', async () => {
    mockUser(daysAgo(10));
    mockActivityCount(2);
    render(<TestComponent />, { wrapper: Wrapper });
    expect(await screen.findByText('established')).toBeInTheDocument();
});

test('tenure at exactly 14 days is established without an activity check', async () => {
    mockUser(daysAgo(14));
    mockActivityCount(0);
    render(<TestComponent />, { wrapper: Wrapper });
    expect(await screen.findByText('established')).toBeInTheDocument();
});

test('long-tenured user is established without an activity check', async () => {
    mockUser(daysAgo(365));
    mockActivityCount(0);
    render(<TestComponent />, { wrapper: Wrapper });
    expect(await screen.findByText('established')).toBeInTheDocument();
});
