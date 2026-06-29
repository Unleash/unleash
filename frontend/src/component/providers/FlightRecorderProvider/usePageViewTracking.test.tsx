import { useState } from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useNavigate } from 'react-router';
import { expect, it, vi } from 'vitest';
import { render } from 'utils/testRenderer';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { usePageViewTracking } from './usePageViewTracking';

const server = testServerSetup();

// An exact leaf route and a delegating `/*` route, so both resolution paths run.
const routes = [
    { path: '/projects/:projectId/features/:featureId/edit' },
    { path: '/projects/:projectId/*' },
];

// Renders once ui-config resolves, so a test can wait for the ready gate.
const ConfigProbe = () => {
    const { uiConfig } = useUiConfig();
    return uiConfig?.unleashContext ? <span>config-ready</span> : null;
};

const Harness = ({ recorder }: { recorder: { record: () => void } | null }) => {
    const [tick, setTick] = useState(0);
    // Fresh array every render to prove a re-render can't refire the effect.
    usePageViewTracking(recorder as never, [...routes]);
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
        </>
    );
};

const respondWithIdentity = () =>
    testServerRoute(server, '/api/admin/ui-config', {
        unleashContext: { userId: 'u-1' },
    });

it('records a page view for the landing page and for each later navigation, with the previous page as referrer', async () => {
    respondWithIdentity();
    const record = vi.fn();

    // Splat route keeps the 'settings' tail; first view's referrer is external.
    render(<Harness recorder={{ record }} />, {
        route: '/projects/default/settings',
    });
    await screen.findByText('config-ready');

    expect(record).toHaveBeenCalledWith({
        eventType: 'custom',
        eventName: 'pageview',
        context: { userId: 'u-1' },
        payload: {
            pageviewId: expect.any(String),
            path: '/projects/:projectId/settings',
            params: { projectId: 'default' },
            referrer: expect.any(String),
        },
    });

    await userEvent.click(
        screen.getByRole('button', { name: 'go to feature edit' }),
    );

    expect(record).toHaveBeenLastCalledWith({
        eventType: 'custom',
        eventName: 'pageview',
        context: { userId: 'u-1' },
        payload: {
            pageviewId: expect.any(String),
            path: '/projects/:projectId/features/:featureId/edit',
            params: { projectId: 'default', featureId: 'new-onboarding' },
            referrer: '/projects/:projectId/settings',
        },
    });
    expect(record).toHaveBeenCalledTimes(2);
});

it('does not record a duplicate page view while the path is unchanged', async () => {
    respondWithIdentity();
    const record = vi.fn();

    render(<Harness recorder={{ record }} />, {
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

    expect(record).toHaveBeenCalledTimes(1);
});

it('does not record a page view for an unrecognized route', async () => {
    respondWithIdentity();
    const record = vi.fn();

    // Wait for the gate first, so the skip is provably deliberate rather than the
    // gate still holding the view back.
    render(<Harness recorder={{ record }} />, {
        route: '/nope/nowhere',
    });
    await screen.findByText('config-ready');

    expect(record).not.toHaveBeenCalled();
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
