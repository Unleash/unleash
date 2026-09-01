import { screen } from '@testing-library/react';
import { Route, Routes } from 'react-router';
import { expect, test } from 'vitest';
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
