import { beforeEach, describe, expect, test, vi } from 'vitest';
import { screen, fireEvent, within } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import { StrategyFormBody } from './StrategyFormBody.tsx';
import type { IStrategy, StrategyFormState } from 'interfaces/strategy';
import type { IFormErrors } from 'hooks/useFormErrors';
import { setupSegmentsEndpoint } from '../FeatureStrategyCreate/featureStrategyFormTestSetup.ts';

beforeEach(() => {
    setupSegmentsEndpoint();
});

const noopErrors: IFormErrors = {
    getFormError: () => undefined,
    setFormError: () => {},
    removeFormError: () => {},
    hasFormErrors: () => false,
};

const flexibleRolloutDefinition: IStrategy = {
    name: 'flexibleRollout',
    displayName: 'Gradual rollout',
    description: '',
    editable: true,
    deprecated: false,
    parameters: [
        {
            name: 'rollout',
            description: '',
            type: 'percentage',
            required: false,
        },
        {
            name: 'stickiness',
            description: '',
            type: 'stickiness',
            required: false,
        },
        { name: 'groupId', description: '', type: 'groupId', required: false },
    ],
};

const defaultStrategyDefinition: IStrategy = {
    name: 'default',
    displayName: 'Standard',
    description: '',
    editable: true,
    deprecated: false,
    parameters: [],
};

const flexibleRolloutStrategy: StrategyFormState = {
    name: 'flexibleRollout',
    parameters: {
        rollout: '50',
        stickiness: 'default',
        groupId: 'my-feature',
    },
    constraints: [],
    segments: [],
};

const setupComponent = (
    strategy: StrategyFormState = flexibleRolloutStrategy,
    strategyDefinition: IStrategy = flexibleRolloutDefinition,
) =>
    render(
        <StrategyFormBody
            strategy={strategy}
            setStrategy={() => {}}
            strategyDefinition={strategyDefinition}
            errors={noopErrors}
            onSubmit={vi.fn()}
        />,
    );

const findSectionButton = (name: string) =>
    screen.findByRole('button', { name: new RegExp(`^${name}`) });

describe('StrategyFormBody', () => {
    test('Target audience and Rollout percentage sections are expanded by default', async () => {
        setupComponent();

        const targetAudience = await findSectionButton('Target audience');
        const rolloutPercentage = await findSectionButton('Rollout percentage');

        expect(targetAudience).toHaveAttribute('aria-expanded', 'true');
        expect(rolloutPercentage).toHaveAttribute('aria-expanded', 'true');
    });

    test('Variants section is collapsed by default and can be expanded', async () => {
        setupComponent();

        const variants = await findSectionButton('Variants');
        expect(variants).toHaveAttribute('aria-expanded', 'false');

        fireEvent.click(variants);
        expect(variants).toHaveAttribute('aria-expanded', 'true');
    });

    test('Variants section is not rendered when the strategy has no stickiness parameter', async () => {
        setupComponent(
            { name: 'default', parameters: {}, constraints: [] },
            defaultStrategyDefinition,
        );

        await findSectionButton('Target audience');
        expect(screen.queryByText('Variants')).not.toBeInTheDocument();
    });

    test('shows a hint about targeting based on whether constraints or segments are set', async () => {
        const { rerender } = setupComponent();

        expect(
            await screen.findByText('Everyone in production'),
        ).toBeInTheDocument();

        rerender(
            <StrategyFormBody
                strategy={{
                    ...flexibleRolloutStrategy,
                    constraints: [
                        { contextName: 'appName', operator: 'IN', values: [] },
                    ],
                }}
                setStrategy={() => {}}
                strategyDefinition={flexibleRolloutDefinition}
                errors={noopErrors}
                onSubmit={vi.fn()}
            />,
        );

        expect(
            await screen.findByText('A subset of users'),
        ).toBeInTheDocument();
    });

    test('shows the rollout percentage as a hint for the flexible rollout strategy', async () => {
        setupComponent();

        const rolloutPercentage = await findSectionButton('Rollout percentage');
        expect(within(rolloutPercentage).getByText('50%')).toBeInTheDocument();
    });

    test('falls back to the strategy definition display name when not a flexible rollout', async () => {
        setupComponent(
            { name: 'default', parameters: {}, constraints: [] },
            defaultStrategyDefinition,
        );

        expect(
            await screen.findByRole('button', { name: /^Standard/ }),
        ).toBeInTheDocument();
    });
});
