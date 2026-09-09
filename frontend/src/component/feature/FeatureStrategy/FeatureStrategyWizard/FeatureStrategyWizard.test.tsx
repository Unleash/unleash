import { describe, expect, it } from 'vitest';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { Route, Routes } from 'react-router';
import { render } from 'utils/testRenderer';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import { FeatureStrategyWizard } from './FeatureStrategyWizard.tsx';

const server = testServerSetup();

const projectId = 'default';
const featureId = 'my-flag';
const environmentId = 'production';
const featurePath = `/projects/${projectId}/features/${featureId}`;

const TEMPLATE = {
    id: 'template-1',
    name: 'Gradual release',
    description: 'A staged rollout',
    project: null,
    milestones: [{ id: 'milestone-1', name: 'Milestone 1', strategies: [] }],
};

const ACTIVE_PLAN = {
    id: 'plan-1',
    name: 'Existing plan',
    milestones: [],
};

const setupApi = ({
    activeReleasePlan = false,
    templates = [TEMPLATE],
} = {}) => {
    testServerRoute(server, '/api/admin/ui-config', {
        versionInfo: { current: { enterprise: '1.0.0' } },
    });
    testServerRoute(server, `/api/admin/projects/${projectId}/overview`, {
        featureTypeCounts: [],
        environments: [{ environment: environmentId }],
    });
    testServerRoute(
        server,
        `/api/admin/projects/${projectId}/features/${featureId}`,
        {
            name: featureId,
            environments: activeReleasePlan
                ? [{ name: environmentId, releasePlans: [ACTIVE_PLAN] }]
                : [],
        },
    );
    testServerRoute(server, '/api/admin/strategies', { strategies: [] });
    // Project templates
    testServerRoute(
        server,
        `/api/admin/projects/${projectId}/release-templates`,
        templates,
    );
    // Global templates
    testServerRoute(
        server,
        `/api/admin/release-plan-templates/${TEMPLATE.id}`,
        TEMPLATE,
    );
};

const renderWizard = ({
    initialScreen,
}: {
    initialScreen?: 'cards' | 'templates';
} = {}) => {
    const dismissals: true[] = [];
    const onClose = () => dismissals.push(true);

    const wizard = ({ open }: { open: boolean }) => (
        <Routes>
            <Route
                path='/projects/:projectId/features/:featureId'
                element={
                    <FeatureStrategyWizard
                        projectId={projectId}
                        featureId={featureId}
                        environmentId={environmentId}
                        open={open}
                        onClose={onClose}
                        initialScreen={initialScreen}
                    />
                }
            />
        </Routes>
    );

    const { rerender } = render(wizard({ open: true }), { route: featurePath });

    const setOpen = (open: boolean) => rerender(wizard({ open }));

    return { dismissals, setOpen };
};

const releasePlansPostRoute = () =>
    testServerRoute(
        server,
        `/api/admin/projects/${projectId}/features/${featureId}/environments/${environmentId}/release-plans`,
        {},
        'post',
    );

const header = () => screen.getByRole('heading', { level: 2 });

describe('the strategy wizard dialog', () => {
    it('opens on the setup cards', async () => {
        setupApi();
        renderWizard();

        expect(header()).toHaveTextContent('Add strategy');
        await screen.findByText('Use project default');
        await screen.findByText('Set up manually');
    });

    it('closes on the close button', async () => {
        setupApi();
        const { dismissals } = renderWizard();

        fireEvent.click(await screen.findByRole('button', { name: 'close' }));

        expect(dismissals).toHaveLength(1);
    });

    it('navigates to the template screen and back again', async () => {
        setupApi();
        renderWizard();

        fireEvent.click(
            await screen.findByRole('button', { name: 'Select template' }),
        );

        expect(header()).toHaveTextContent('Select template');
        await screen.findByText(TEMPLATE.name);

        fireEvent.click(screen.getByRole('button', { name: /Go back/ }));

        expect(header()).toHaveTextContent('Add strategy');
        await screen.findByText('Set up manually');
    });

    it('opens straight onto the template screen', async () => {
        setupApi();
        renderWizard({ initialScreen: 'templates' });

        expect(header()).toHaveTextContent('Select template');
        await screen.findByText(TEMPLATE.name);
    });

    it('returns to the setup cards when reopened', async () => {
        setupApi();
        const { setOpen } = renderWizard();

        fireEvent.click(
            await screen.findByRole('button', { name: 'Select template' }),
        );
        expect(header()).toHaveTextContent('Select template');

        setOpen(false);
        setOpen(true);

        expect(header()).toHaveTextContent('Add strategy');
        await screen.findByText('Set up manually');
    });

    it('applies a release plan from the template screen', async () => {
        setupApi();
        const { requests } = releasePlansPostRoute();
        const { dismissals } = renderWizard({ initialScreen: 'templates' });

        await screen.findByText(TEMPLATE.name);
        fireEvent.click(screen.getByRole('button', { name: 'Apply' }));

        await waitFor(() => expect(requests).toHaveLength(1));
        expect(requests[0]).toMatchObject({ templateId: TEMPLATE.id });
        await waitFor(() => expect(dismissals).toHaveLength(1));
    });

    it('previews a template and returns to the template list', async () => {
        setupApi();
        renderWizard({ initialScreen: 'templates' });

        await screen.findByText(TEMPLATE.name);
        fireEvent.click(screen.getByRole('button', { name: 'Preview' }));

        await screen.findByRole('button', { name: 'Apply template' });

        fireEvent.click(screen.getByRole('button', { name: /Go back/ }));

        expect(header()).toHaveTextContent('Select template');
        await screen.findByRole('button', { name: 'Apply' });
    });

    it('points to the release template settings when the project has no templates', async () => {
        setupApi({ templates: [] });
        renderWizard({ initialScreen: 'templates' });

        await screen.findByText(
            "You don't have any release templates set up yet",
        );

        expect(
            screen.getByRole('link', { name: 'Configure > Release templates' }),
        ).toHaveAttribute('href', '/release-templates');
        expect(
            screen.getByRole('link', { name: 'documentation' }),
        ).toHaveAttribute(
            'href',
            'https://docs.getunleash.io/concepts/release-templates',
        );
    });

    it('asks before replacing an existing release plan', async () => {
        setupApi({ activeReleasePlan: true });
        const { requests } = releasePlansPostRoute();
        const { dismissals } = renderWizard({ initialScreen: 'templates' });

        await screen.findByText(TEMPLATE.name);
        fireEvent.click(screen.getByRole('button', { name: 'Apply' }));

        await screen.findByText('Replace release plan?');
        expect(requests).toHaveLength(0);

        fireEvent.click(
            screen.getByRole('button', { name: 'Add release plan' }),
        );

        await waitFor(() => expect(requests).toHaveLength(1));
        await waitFor(() => expect(dismissals).toHaveLength(1));
    });
});
