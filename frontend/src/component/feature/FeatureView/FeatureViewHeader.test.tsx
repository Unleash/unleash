import { expect, test, vi } from 'vitest';
import { Route, Routes } from 'react-router';
import { render } from 'utils/testRenderer';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import { EventTrackerContext } from 'contexts/EventTrackerContext';
import {
    DELETE_FEATURE,
    UPDATE_FEATURE,
} from 'component/providers/AccessProvider/permissions';
import type { IFeatureToggle } from 'interfaces/featureToggle';
import { FeatureViewHeader } from './FeatureViewHeader.tsx';

const server = testServerSetup();

const projectId = 'default';
const featureId = 'my-flag';
const featurePath = `/api/admin/projects/${projectId}/features/${featureId}`;

const feature = {
    name: featureId,
    project: projectId,
    stale: false,
    favorite: false,
    environments: [],
    children: [],
} as unknown as IFeatureToggle;

const renderHeader = (
    trackEvent: (...args: unknown[]) => void,
    overrides: Partial<IFeatureToggle> = {},
) => {
    testServerRoute(server, featurePath, { ...feature, ...overrides });

    return render(
        <EventTrackerContext.Provider value={{ trackEvent }}>
            <Routes>
                <Route
                    path='/projects/:projectId/features/:featureId'
                    element={
                        <FeatureViewHeader
                            feature={{ ...feature, ...overrides }}
                        />
                    }
                />
            </Routes>
        </EventTrackerContext.Provider>,
        {
            route: `/projects/${projectId}/features/${featureId}`,
            permissions: [
                { permission: UPDATE_FEATURE },
                { permission: DELETE_FEATURE },
            ],
        },
    );
};

const openKebab = () =>
    userEvent.click(
        screen.getByRole('button', { name: /feature flag actions/i }),
    );

test('tracks marking a flag as stale after the update succeeds', async () => {
    server.use(http.patch(featurePath, () => HttpResponse.json({})));
    const trackEvent = vi.fn();
    renderHeader(trackEvent);

    await openKebab();
    await userEvent.click(
        screen.getByRole('menuitem', { name: /toggle stale state/i }),
    );
    await userEvent.click(
        await screen.findByRole('button', { name: /flip to stale/i }),
    );

    await waitFor(() =>
        expect(trackEvent).toHaveBeenCalledWith('flag-actions', {
            props: { eventType: 'stale-toggled', newState: 'stale' },
        }),
    );
});

test("reports newState: 'active' when flipping a stale flag back to active", async () => {
    server.use(http.patch(featurePath, () => HttpResponse.json({})));
    const trackEvent = vi.fn();
    renderHeader(trackEvent, { stale: true });

    await openKebab();
    await userEvent.click(
        screen.getByRole('menuitem', { name: /toggle stale state/i }),
    );
    await userEvent.click(
        await screen.findByRole('button', { name: /flip to active/i }),
    );

    await waitFor(() =>
        expect(trackEvent).toHaveBeenCalledWith('flag-actions', {
            props: { eventType: 'stale-toggled', newState: 'active' },
        }),
    );
});

test('does not track a stale change that the API rejects', async () => {
    server.use(
        http.patch(featurePath, () => HttpResponse.json({}, { status: 400 })),
    );
    const trackEvent = vi.fn();
    renderHeader(trackEvent);

    await openKebab();
    await userEvent.click(
        screen.getByRole('menuitem', { name: /toggle stale state/i }),
    );
    await userEvent.click(
        await screen.findByRole('button', { name: /flip to stale/i }),
    );

    await waitFor(() => expect(trackEvent).not.toHaveBeenCalled());
});

test('tracks archiving a flag after the archive succeeds', async () => {
    testServerRoute(
        server,
        `/api/admin/projects/${projectId}/archive/validate`,
        { parentsWithChildFeatures: [], hasDeletedDependencies: false },
        'post',
    );
    testServerRoute(server, featurePath, {}, 'delete');
    const trackEvent = vi.fn();
    renderHeader(trackEvent);

    await openKebab();
    await userEvent.click(
        screen.getByRole('menuitem', { name: /archive feature flag/i }),
    );
    await userEvent.click(
        await screen.findByRole('button', { name: /^archive flag$/i }),
    );

    await waitFor(() =>
        expect(trackEvent).toHaveBeenCalledWith('flag-actions', {
            props: { eventType: 'archived' },
        }),
    );
});
