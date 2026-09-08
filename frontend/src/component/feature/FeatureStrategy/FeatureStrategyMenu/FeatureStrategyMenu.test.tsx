import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import { EventTrackerContext } from 'contexts/EventTrackerContext';
import { FeatureStrategyMenu } from './FeatureStrategyMenu.tsx';

const server = testServerSetup();

const projectId = 'default';
const featureId = 'my-flag';
const environmentId = 'production';

const ENVIRONMENT_DEFAULT_STRATEGY = {
    name: 'flexibleRollout',
    title: '50% of all users',
    parameters: { rollout: '50' },
};

const ADVANCED_STRATEGY_NAME = 'remoteAddress';

const setupApi = ({
    defaultStrategy = ENVIRONMENT_DEFAULT_STRATEGY as object | null,
    changeRequests = false,
}: {
    defaultStrategy?: object | null;
    changeRequests?: boolean;
} = {}) => {
    // Change requests are enterprise-only
    testServerRoute(server, '/api/admin/ui-config', {
        versionInfo: {
            current: changeRequests
                ? { enterprise: '1.0.0' }
                : { oss: '1.0.0' },
        },
    });
    testServerRoute(
        server,
        `/api/admin/projects/${projectId}/release-templates`,
        [],
        'get',
        200,
        { include: 'root' },
    );
    testServerRoute(server, '/api/admin/strategies', {
        strategies: [
            {
                name: ENVIRONMENT_DEFAULT_STRATEGY.name,
                editable: false,
                deprecated: false,
                advanced: false,
            },
            {
                name: ADVANCED_STRATEGY_NAME,
                editable: false,
                deprecated: false,
                advanced: true,
            },
        ],
    });
    testServerRoute(server, `/api/admin/projects/${projectId}/overview`, {
        featureTypeCounts: [],
        environments: [
            {
                environment: environmentId,
                ...(defaultStrategy ? { defaultStrategy } : {}),
            },
        ],
    });
    testServerRoute(
        server,
        `/api/admin/projects/${projectId}/change-requests/config`,
        changeRequests
            ? [{ environment: environmentId, changeRequestEnabled: true }]
            : [],
    );
    testServerRoute(
        server,
        `/api/admin/projects/${projectId}/change-requests/pending`,
        [],
    );
    testServerRoute(
        server,
        `/api/admin/projects/${projectId}/features/${featureId}`,
        { name: featureId, environments: [] },
    );
};

const renderMenu = () => {
    const closes: true[] = [];
    const trackEvent = vi.fn();

    render(
        <EventTrackerContext.Provider value={{ trackEvent }}>
            <FeatureStrategyMenu
                projectId={projectId}
                featureId={featureId}
                environmentId={environmentId}
                isStrategyMenuDialogOpen={true}
                onClose={() => closes.push(true)}
            />
        </EventTrackerContext.Provider>,
        { route: `/projects/${projectId}/features/${featureId}` },
    );

    return { closes, trackEvent };
};

// Both the project default card and every strategy card offer "Configure", so
// narrow the dialog down to one section before asking for a button by name.
const filterTo = async (label: string) => {
    fireEvent.click(await screen.findByRole('button', { name: label }));
};

const strategiesPostRoute = () =>
    testServerRoute(
        server,
        `/api/admin/projects/${projectId}/features/${featureId}/environments/${environmentId}/strategies`,
        {},
        'post',
    );

describe('adding a strategy from the menu', () => {
    beforeEach(() => {
        setupApi();
    });

    it('applies the environment default strategy without opening a form', async () => {
        const { requests } = strategiesPostRoute();
        const { closes, trackEvent } = renderMenu();
        await filterTo('Project default');

        // The card shows the environment's default once the project overview
        // has loaded; clicking before that would apply the fallback instead.
        await screen.findByText('50% of all users');
        fireEvent.click(screen.getByRole('button', { name: 'Apply' }));

        await waitFor(() => expect(requests).toHaveLength(1));
        expect(requests[0]).toMatchObject({
            name: 'flexibleRollout',
            title: '50% of all users',
            parameters: { rollout: '50' },
        });
        expect(trackEvent).toHaveBeenCalledWith('strategy-add', {
            props: { buttonTitle: 'Gradual rollout' },
        });
        expect(window.location.pathname).toBe(
            `/projects/${projectId}/features/${featureId}`,
        );
        await waitFor(() => expect(closes).toHaveLength(1));
    });

    it('adds the default strategy to a draft in a change-request environment', async () => {
        setupApi({ changeRequests: true });
        const { requests } = testServerRoute(
            server,
            `/api/admin/projects/${projectId}/environments/${environmentId}/change-requests`,
            {},
            'post',
        );
        renderMenu();
        await filterTo('Project default');

        await screen.findByText('50% of all users');
        fireEvent.click(screen.getByRole('button', { name: 'Apply' }));

        await waitFor(() => expect(requests).toHaveLength(1));
        expect(requests[0]).toMatchObject({
            action: 'addStrategy',
            feature: featureId,
            payload: { name: 'flexibleRollout', title: '50% of all users' },
        });
    });

    it('falls back to a 100% gradual rollout when the environment has no default', async () => {
        setupApi({ defaultStrategy: null });
        const { requests } = strategiesPostRoute();
        renderMenu();
        await filterTo('Project default');

        await screen.findByText('100% of all users');
        fireEvent.click(screen.getByRole('button', { name: 'Apply' }));

        await waitFor(() => expect(requests).toHaveLength(1));
        expect(requests[0]).toMatchObject({
            name: 'flexibleRollout',
            title: '100% of all users',
            parameters: {},
        });
    });

    it('opens the create-strategy form prefilled with the environment default', async () => {
        const { closes, trackEvent } = renderMenu();
        await filterTo('Project default');

        await screen.findByText('50% of all users');
        fireEvent.click(screen.getByRole('button', { name: 'Configure' }));

        await waitFor(() => {
            expect(window.location.pathname).toBe(
                `/projects/${projectId}/features/${featureId}/strategies/create`,
            );
        });
        expect(window.location.search).toContain(
            'strategyName=flexibleRollout',
        );
        expect(window.location.search).toContain('defaultStrategy=true');
        expect(trackEvent).toHaveBeenCalledWith('strategy-add', {
            props: { buttonTitle: 'Default strategy' },
        });
        expect(closes).toHaveLength(1);
    });

    it('opens the create-strategy form when configuring a strategy type', async () => {
        const { closes, trackEvent } = renderMenu();
        await filterTo('Advanced strategies');

        fireEvent.click(
            await screen.findByRole('button', { name: 'Configure' }),
        );

        await waitFor(() => {
            expect(window.location.pathname).toBe(
                `/projects/${projectId}/features/${featureId}/strategies/create`,
            );
        });
        expect(window.location.search).toContain(
            `strategyName=${ADVANCED_STRATEGY_NAME}`,
        );
        expect(window.location.search).toContain(
            `environmentId=${environmentId}`,
        );
        expect(trackEvent).toHaveBeenCalledWith('strategy-add', {
            props: { buttonTitle: 'IPs' },
        });
        expect(closes).toHaveLength(1);
    });
});
