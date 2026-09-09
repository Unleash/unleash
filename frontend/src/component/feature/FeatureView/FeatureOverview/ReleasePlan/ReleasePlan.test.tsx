import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router';
import { expect, test } from 'vitest';
import { UPDATE_FEATURE_STRATEGY } from 'component/providers/AccessProvider/permissions.ts';
import type {
    IReleasePlan,
    IReleasePlanMilestone,
} from 'interfaces/releasePlans';
import type { TransitionConditionSchema } from 'openapi';
import { render } from 'utils/testRenderer';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import { ReleasePlan } from './ReleasePlan.tsx';

const server = testServerSetup();

const milestone = (
    name: string,
    transitionCondition?: TransitionConditionSchema,
): IReleasePlanMilestone => ({
    id: `milestone-${name}`,
    name,
    releasePlanDefinitionId: 'plan-1',
    strategies: [],
    transitionCondition,
});

const planWith = (milestones: IReleasePlanMilestone[]): IReleasePlan => ({
    id: 'plan-1',
    name: 'Gradual rollout',
    description: '',
    createdAt: '2026-08-31T00:00:00.000Z',
    createdByUserId: 1,
    featureName: 'my-feature',
    environment: 'development',
    safeguards: [],
    milestones,
});

const renderReadonlyPlan = (plan: IReleasePlan) => {
    testServerRoute(server, '/api/admin/ui-config', {
        flags: { exposureBasedAutomation: true },
    });
    testServerRoute(
        server,
        '/api/admin/projects/default/change-requests/pending',
        [],
    );
    render(
        <Routes>
            <Route
                path='/projects/:projectId'
                element={<ReleasePlan plan={plan} readonly />}
            />
        </Routes>,
        { route: '/projects/default' },
    );
};

test('readonly release plan shows each milestone automation so reviewers see what a plan will do', async () => {
    renderReadonlyPlan(
        planWith([
            milestone('Internal', { intervalMinutes: 120 }),
            milestone('Beta', { type: 'exposure', minimumExposures: 500 }),
            milestone('Everyone', { intervalMinutes: 180 }),
        ]),
    );

    await screen.findByText('Everyone');

    expect(
        screen.getByText(
            'Proceed to the next milestone after 2 hours from milestone start',
        ),
    ).toBeInTheDocument();
    expect(
        screen.getByText(
            'Proceed to the next milestone after 500 exposures since feature creation',
        ),
    ).toBeInTheDocument();
    expect(
        screen.queryByText(
            'Proceed to the next milestone after 3 hours from milestone start',
        ),
    ).not.toBeInTheDocument();
});

test('a readonly plan offers no editing controls', async () => {
    renderReadonlyPlan(
        planWith([
            milestone('Customers 50%', { intervalMinutes: 120 }),
            milestone('Customers 75%', {
                type: 'exposure',
                minimumExposures: 500,
            }),
            milestone('Everyone'),
        ]),
    );

    await screen.findByText('Everyone');

    expect(
        screen.queryByRole('button', { name: /add automation/i }),
    ).not.toBeInTheDocument();
    expect(
        screen.queryByRole('button', { name: /remove automation/i }),
    ).not.toBeInTheDocument();
});

const renderEditablePlan = (plan: IReleasePlan) => {
    testServerRoute(server, '/api/admin/ui-config', {
        flags: { exposureBasedAutomation: true },
    });
    testServerRoute(
        server,
        '/api/admin/projects/default/change-requests/pending',
        [],
    );
    testServerRoute(server, '/api/admin/client-metrics/features/my-feature', {
        lastHourUsage: [],
        seenApplications: [],
        totalUsage: [{ environment: 'development', yes: 512, no: 100 }],
    });
    render(
        <Routes>
            <Route
                path='/projects/:projectId/features/:featureId'
                element={<ReleasePlan plan={plan} />}
            />
        </Routes>,
        {
            route: '/projects/default/features/my-feature',
            permissions: [{ permission: UPDATE_FEATURE_STRATEGY }],
        },
    );
};

test("shows the environment's exposure progress while configuring an exposure automation", async () => {
    renderEditablePlan(
        planWith([milestone('Internal'), milestone('Everyone')]),
    );

    await userEvent.click(
        await screen.findByRole('button', { name: /add automation/i }),
    );
    await userEvent.click(screen.getByLabelText('Condition unit'));
    await userEvent.click(
        await screen.findByRole('option', { name: 'Exposures' }),
    );

    expect((await screen.findByText(/~510\//)).textContent).toBe(
        '~510/5 exposures',
    );
});

test("shows the environment's exposure progress on a saved exposure automation", async () => {
    renderEditablePlan(
        planWith([
            milestone('Internal', { type: 'exposure', minimumExposures: 1000 }),
            milestone('Everyone'),
        ]),
    );

    expect((await screen.findByText(/~510\//)).textContent).toBe(
        '~510/1K exposures',
    );
});
