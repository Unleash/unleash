import { describe, expect, it } from 'vitest';
import { fireEvent, screen } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import { FeatureStrategyWizard } from './FeatureStrategyWizard.tsx';

const server = testServerSetup();

const projectId = 'default';
const featureId = 'my-flag';
const environmentId = 'production';

const setupApi = () => {
    testServerRoute(server, '/api/admin/ui-config', {
        versionInfo: { current: { oss: '1.0.0' } },
    });
    testServerRoute(server, `/api/admin/projects/${projectId}/overview`, {
        featureTypeCounts: [],
        environments: [{ environment: environmentId }],
    });
    testServerRoute(server, '/api/admin/strategies', { strategies: [] });
};

const renderWizard = () => {
    const dismissals: true[] = [];

    render(
        <FeatureStrategyWizard
            projectId={projectId}
            featureId={featureId}
            environmentId={environmentId}
            open={true}
            onClose={() => dismissals.push(true)}
        />,
        { route: `/projects/${projectId}/features/${featureId}` },
    );

    return { dismissals };
};

describe('the strategy wizard dialog', () => {
    it('opens on the setup cards', async () => {
        setupApi();
        renderWizard();

        expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
            'Add strategy',
        );
        await screen.findByText('Use project default');
        await screen.findByText('Set up manually');
    });

    it('closes on the close button', async () => {
        setupApi();
        const { dismissals } = renderWizard();

        fireEvent.click(await screen.findByRole('button', { name: 'close' }));

        expect(dismissals).toHaveLength(1);
    });
});
