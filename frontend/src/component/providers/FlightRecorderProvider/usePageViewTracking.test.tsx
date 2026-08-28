import { useState } from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useNavigate } from 'react-router';
import { beforeEach, expect, it, vi } from 'vitest';
import { render } from 'utils/testRenderer';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { usePageViewTracking } from './usePageViewTracking';

const server = testServerSetup();

type FakeRecorder = {
    record: ReturnType<typeof vi.fn>;
    flush: ReturnType<typeof vi.fn>;
};

let recorded: any[];
let recorder: FakeRecorder;
const pageviews = () => recorded.filter((e) => e.eventName === 'pageview');
const pageleaves = () => recorded.filter((e) => e.eventName === 'pageleave');

beforeEach(() => {
    recorded = [];
    recorder = {
        record: vi.fn((event) => recorded.push(event)),
        flush: vi.fn(),
    };
});

// Signals when ui-config resolved, so a test can wait for the ready gate.
const ConfigProbe = () => {
    const { uiConfig } = useUiConfig();
    return uiConfig?.unleashContext ? <span>config-ready</span> : null;
};

const Harness = ({ recorder }: { recorder: FakeRecorder | null }) => {
    const [tick, setTick] = useState(0);
    usePageViewTracking(recorder as never);
    const navigate = useNavigate();
    return (
        <>
            <ConfigProbe />
            <button
                type='button'
                onClick={() =>
                    navigate('/projects/default/features/new-onboarding/edit')
                }
            >
                go to feature edit
            </button>
            <button
                type='button'
                onClick={() =>
                    navigate(
                        '/projects/default/features/new-onboarding/edit?tab=metrics',
                    )
                }
            >
                change only the query string
            </button>
            <button type='button' onClick={() => setTick(tick + 1)}>
                re-render without navigating
            </button>
            <button
                type='button'
                onClick={() => navigate('/projects/default/settings/')}
            >
                add a trailing slash
            </button>
        </>
    );
};

const respondWithIdentity = () =>
    testServerRoute(server, '/api/admin/ui-config', {
        unleashContext: { userId: 'u-1' },
    });

it('records the full visited path for the landing page and each later navigation, with the previous page as referrer', async () => {
    respondWithIdentity();

    // First view's referrer is external (document.referrer).
    render(<Harness recorder={recorder} />, {
        route: '/projects/default/settings',
    });
    await screen.findByText('config-ready');

    expect(pageviews()).toEqual([
        {
            eventType: 'custom',
            eventName: 'pageview',
            context: { userId: 'u-1' },
            payload: {
                pageviewId: expect.any(String),
                path: '/projects/default/settings',
                referrer: expect.any(String),
            },
        },
    ]);

    await userEvent.click(
        screen.getByRole('button', { name: 'go to feature edit' }),
    );

    expect(pageviews()[1]).toEqual({
        eventType: 'custom',
        eventName: 'pageview',
        context: { userId: 'u-1' },
        payload: {
            pageviewId: expect.any(String),
            path: '/projects/default/features/new-onboarding/edit',
            referrer: '/projects/default/settings',
        },
    });
});

it('records a page leave carrying engaged time, paired to the page left, before the next view', async () => {
    respondWithIdentity();

    render(<Harness recorder={recorder} />, {
        route: '/projects/default/settings',
    });
    await screen.findByText('config-ready');
    const landingId = pageviews()[0].payload.pageviewId;

    await userEvent.click(
        screen.getByRole('button', { name: 'go to feature edit' }),
    );

    // Leave fires between the two views and joins back to the page it closed.
    expect(recorded.map((e) => e.eventName)).toEqual([
        'pageview',
        'pageleave',
        'pageview',
    ]);
    expect(pageleaves()).toEqual([
        {
            eventType: 'custom',
            eventName: 'pageleave',
            context: { userId: 'u-1' },
            payload: {
                pageviewId: landingId,
                path: '/projects/default/settings',
                engagedMs: expect.any(Number),
            },
        },
    ]);
});

it('records a page leave for the current page when the tab is closed', async () => {
    respondWithIdentity();

    render(<Harness recorder={recorder} />, {
        route: '/projects/default/settings',
    });
    await screen.findByText('config-ready');
    const landingId = pageviews()[0].payload.pageviewId;

    // pagehide is the only signal a closing tab gives; the leave must be recorded
    // and flushed with keepalive there, since no navigation will follow.
    window.dispatchEvent(new Event('pagehide'));

    expect(pageleaves()).toEqual([
        {
            eventType: 'custom',
            eventName: 'pageleave',
            context: { userId: 'u-1' },
            payload: {
                pageviewId: landingId,
                path: '/projects/default/settings',
                engagedMs: expect.any(Number),
            },
        },
    ]);
    expect(recorder.flush).toHaveBeenCalledWith({ keepalive: true });
});

it('opens a fresh page view when the page is restored from bfcache', async () => {
    respondWithIdentity();

    render(<Harness recorder={recorder} />, {
        route: '/projects/default/settings',
    });
    await screen.findByText('config-ready');
    const firstId = pageviews()[0].payload.pageviewId;

    // bfcache freeze + restore fires no SPA navigation, so the view must be reopened
    // off pageshow rather than relying on the navigation effect.
    window.dispatchEvent(new Event('pagehide'));
    const pageshow = new Event('pageshow');
    Object.defineProperty(pageshow, 'persisted', { value: true });
    window.dispatchEvent(pageshow);

    const views = pageviews();
    expect(views).toHaveLength(2);
    expect(views[1].payload.path).toBe('/projects/default/settings');
    expect(views[1].payload.pageviewId).not.toBe(firstId);
});

it('does not open a bfcache page view before identity has loaded', async () => {
    // No identity response: context never resolves, so no userId is available.
    render(<Harness recorder={recorder} />, {
        route: '/projects/default/settings',
    });
    await screen.findByRole('button', { name: 'go to feature edit' });

    const pageshow = new Event('pageshow');
    Object.defineProperty(pageshow, 'persisted', { value: true });
    window.dispatchEvent(pageshow);

    expect(pageviews()).toEqual([]);
});

it('records a page leave for the current page when tracking is torn down', async () => {
    respondWithIdentity();

    const { unmount } = render(<Harness recorder={recorder} />, {
        route: '/projects/default/settings',
    });
    await screen.findByText('config-ready');
    const landingId = pageviews()[0].payload.pageviewId;

    // Unmount (provider teardown / flag-off) must still close the open page.
    unmount();

    expect(pageleaves()).toEqual([
        {
            eventType: 'custom',
            eventName: 'pageleave',
            context: { userId: 'u-1' },
            payload: {
                pageviewId: landingId,
                path: '/projects/default/settings',
                engagedMs: expect.any(Number),
            },
        },
    ]);
});

it('does not record a duplicate page view while the path is unchanged', async () => {
    respondWithIdentity();

    render(<Harness recorder={recorder} />, {
        route: '/projects/default/features/new-onboarding/edit',
    });
    await screen.findByText('config-ready');

    // Path identifies a page; re-render and query-only change aren't new pages.
    await userEvent.click(
        screen.getByRole('button', { name: 're-render without navigating' }),
    );
    await userEvent.click(
        screen.getByRole('button', { name: 'change only the query string' }),
    );

    expect(recorder.record).toHaveBeenCalledTimes(1);
});

it('records one screen without a trailing slash regardless of how the URL was written', async () => {
    respondWithIdentity();

    // The same screen reached with a trailing slash must not become a second path.
    render(<Harness recorder={recorder} />, {
        route: '/projects/default/settings/',
    });
    await screen.findByText('config-ready');

    expect(pageviews()[0].payload.path).toBe('/projects/default/settings');
});

it('does not record a new page view when only a trailing slash is added to the path', async () => {
    respondWithIdentity();

    render(<Harness recorder={recorder} />, {
        route: '/projects/default/settings',
    });
    await screen.findByText('config-ready');

    // A trailing slash names the same screen, so it is not a new page.
    await userEvent.click(
        screen.getByRole('button', { name: 'add a trailing slash' }),
    );

    expect(recorder.record).toHaveBeenCalledTimes(1);
});

it('keeps the app rendering when no recorder is configured', async () => {
    respondWithIdentity();

    // No recorder: hook must no-op without throwing.
    render(<Harness recorder={null} />, {
        route: '/projects/default/settings',
    });
    await userEvent.click(
        screen.getByRole('button', { name: 'go to feature edit' }),
    );

    expect(
        screen.getByRole('button', { name: 'go to feature edit' }),
    ).toBeInTheDocument();
});
