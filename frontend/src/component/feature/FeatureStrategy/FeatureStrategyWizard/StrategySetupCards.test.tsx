import { beforeEach, describe, expect, it } from 'vitest';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import { StrategySetupCards } from './StrategySetupCards.tsx';

const server = testServerSetup();

const projectId = 'default';
const featureId = 'my-flag';
const environmentId = 'production';
const featurePath = `/projects/${projectId}/features/${featureId}`;

const ENVIRONMENT_DEFAULT_STRATEGY = {
    name: 'flexibleRollout',
    title: '50% of all users',
    parameters: { rollout: '50' },
};

const setupApi = () => {
    testServerRoute(server, '/api/admin/ui-config', {
        versionInfo: { current: { oss: '1.0.0' } },
    });
    testServerRoute(server, `/api/admin/projects/${projectId}/overview`, {
        featureTypeCounts: [],
        environments: [
            {
                environment: environmentId,
                defaultStrategy: ENVIRONMENT_DEFAULT_STRATEGY,
            },
        ],
    });
    testServerRoute(
        server,
        `/api/admin/projects/${projectId}/features/${featureId}`,
        { name: featureId, environments: [] },
    );
    testServerRoute(server, '/api/admin/strategies', {
        strategies: [
            { name: 'flexibleRollout', displayName: 'Gradual rollout' },
            { name: 'remoteAddress', displayName: '' },
        ],
    });
};

const renderCards = () => {
    const dialogDismissals: true[] = [];

    render(
        <StrategySetupCards
            projectId={projectId}
            featureId={featureId}
            environmentId={environmentId}
            onClose={() => dialogDismissals.push(true)}
        />,
        { route: featurePath },
    );

    return { dialogDismissals };
};

const strategiesPostRoute = () =>
    testServerRoute(
        server,
        `/api/admin/projects/${projectId}/features/${featureId}/environments/${environmentId}/strategies`,
        {},
        'post',
    );

describe('setting up a strategy from the setup cards', () => {
    beforeEach(() => {
        setupApi();
    });

    it('applies the project default to the environment', async () => {
        const { requests } = strategiesPostRoute();
        const { dialogDismissals } = renderCards();

        await screen.findByText(ENVIRONMENT_DEFAULT_STRATEGY.title);
        fireEvent.click(screen.getByRole('button', { name: 'Apply default' }));

        await waitFor(() => expect(requests).toHaveLength(1));
        expect(requests[0]).toMatchObject({
            name: 'flexibleRollout',
            title: '50% of all users',
            parameters: { rollout: '50' },
        });
        await waitFor(() => expect(dialogDismissals).toHaveLength(1));
    });

    it('keeps the dialog open when applying the default fails', async () => {
        const { requests } = testServerRoute(
            server,
            `/api/admin/projects/${projectId}/features/${featureId}/environments/${environmentId}/strategies`,
            { message: 'Nope' },
            'post',
            403,
        );
        const { dialogDismissals } = renderCards();

        await screen.findByText(ENVIRONMENT_DEFAULT_STRATEGY.title);
        const apply = screen.getByRole('button', { name: 'Apply default' });
        fireEvent.click(apply);

        await waitFor(() => expect(requests).toHaveLength(1));
        await waitFor(() => expect(apply).toBeEnabled());
        expect(dialogDismissals).toHaveLength(0);
    });

    it('cannot apply the default until the project overview has loaded', async () => {
        renderCards();

        const apply = screen.getByRole('button', { name: 'Apply default' });
        expect(apply).toBeDisabled();

        await waitFor(() => expect(apply).toBeEnabled());
    });

    it('opens the gradual rollout form to set a strategy up manually', async () => {
        const { dialogDismissals } = renderCards();

        fireEvent.click(
            await screen.findByRole('button', { name: 'Configure' }),
        );

        await waitFor(() => {
            expect(window.location.pathname).toBe(
                `${featurePath}/strategies/create`,
            );
        });
        expect(window.location.search).toContain(
            'strategyName=flexibleRollout',
        );
        expect(window.location.search).toContain(
            `environmentId=${environmentId}`,
        );
        expect(dialogDismissals).toHaveLength(1);
    });

    it('opens the create form for a strategy picked from the more strategies menu', async () => {
        const { dialogDismissals } = renderCards();

        fireEvent.click(
            await screen.findByRole('button', { name: /More strategies/ }),
        );
        fireEvent.click(screen.getByRole('menuitem', { name: 'IPs' }));

        await waitFor(() => {
            expect(window.location.pathname).toBe(
                `${featurePath}/strategies/create`,
            );
        });
        expect(window.location.search).toContain('strategyName=remoteAddress');
        expect(dialogDismissals).toHaveLength(1);
    });
});
