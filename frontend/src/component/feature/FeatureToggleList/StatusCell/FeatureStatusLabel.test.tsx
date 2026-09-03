import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import { render } from 'utils/testRenderer';
import type { FeatureSearchEnvironmentSchema } from 'openapi';
import { PRODUCTION } from 'constants/environmentTypes';
import { FeatureStatusLabel } from './FeatureStatusLabel.tsx';

const productionEnvironment = (
    overrides: Partial<FeatureSearchEnvironmentSchema> = {},
): FeatureSearchEnvironmentSchema => ({
    name: 'production',
    type: PRODUCTION,
    enabled: true,
    hasStrategies: true,
    hasEnabledStrategies: true,
    ...overrides,
});

const renderStatus = (environments: FeatureSearchEnvironmentSchema[]) =>
    render(
        <FeatureStatusLabel
            lifecycle={{
                stage: 'live',
                enteredStageAt: '2025-04-01T00:00:00Z',
            }}
            environments={environments}
        />,
    );

const tooltipFor = async (label: string) => {
    await userEvent.hover(screen.getByText(label));

    return screen.findByRole('tooltip');
};

describe('FeatureStatusLabel', () => {
    it('explains why a flag is paused', async () => {
        renderStatus([productionEnvironment({ enabled: false })]);

        expect(await tooltipFor('Paused')).toHaveTextContent(
            'Production environments are disabled',
        );
    });

    it('names the environments a partially rolled out flag is enabled in', async () => {
        renderStatus([
            productionEnvironment({ name: 'production-eu' }),
            productionEnvironment({ name: 'production-us', enabled: false }),
        ]);

        expect(
            await tooltipFor('In 1 out of 2 production environments'),
        ).toHaveTextContent('Enabled in: production-eu');
    });

    it('repeats the label for a status that needs no explanation', async () => {
        const milestoneName =
            'Gradual rollout to European enterprise customers';
        renderStatus([
            productionEnvironment({
                totalMilestones: 4,
                milestoneOrder: 0,
                milestoneName,
            }),
        ]);
        const label = `Milestone: ${milestoneName} (1 of 4)`;

        expect(await tooltipFor(label)).toHaveTextContent(label);
    });

    it('shows a healthy flag without a tooltip', async () => {
        renderStatus([productionEnvironment()]);

        await userEvent.hover(screen.getByText('–'));

        expect(screen.queryByRole('tooltip')).toBeNull();
        expect(screen.queryByRole('link')).toBeNull();
    });
});
