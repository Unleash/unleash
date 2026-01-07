import { screen, waitFor } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import { StrategyVariants } from './StrategyVariants.tsx';
import { Route, Routes } from 'react-router-dom';
import { UPDATE_FEATURE_ENVIRONMENT_VARIANTS } from '../../providers/AccessProvider/permissions.ts';
import type { IFeatureStrategy } from '../../../interfaces/strategy.ts';
import { useState } from 'react';

test('should render variants', async () => {
    let currentStrategy: Partial<IFeatureStrategy> = {};
    const initialStrategy = {
        name: '',
        constraints: [],
        parameters: { stickiness: 'clientId' },
        variants: [
            {
                name: 'variantName',
                stickiness: 'default',
                weight: 1000,
                weightType: 'variable' as const,
                payload: {
                    type: 'string' as const,
                    value: 'variantValue',
                },
            },
        ],
    };
    const Parent = () => {
        const [strategy, setStrategy] =
            useState<Partial<IFeatureStrategy>>(initialStrategy);

        currentStrategy = strategy;

        return (
            <StrategyVariants
                strategy={strategy}
                setStrategy={setStrategy}
                projectId={'default'}
                environment={'development'}
            />
        );
    };
    render(
        <Routes>
            <Route
                path={
                    '/projects/:projectId/features/:featureId/strategies/edit'
                }
                element={<Parent />}
            />
        </Routes>,
        {
            route: '/projects/default/features/colors/strategies/edit?environmentId=development&strategyId=2e4f0555-518b-45b3-b0cd-a32cca388a92',
            permissions: [
                {
                    permission: UPDATE_FEATURE_ENVIRONMENT_VARIANTS,
                    project: 'default',
                    environment: 'development',
                },
            ],
        },
    );

    // static form info
    await screen.findByText('Variants');
    const button = await screen.findByText('Add variant');

    // variant form populated
    const variantInput = screen.getByDisplayValue('variantValue');
    expect(variantInput).toBeInTheDocument();

    // overrides disabled
    expect(screen.queryByText('Overrides')).not.toBeInTheDocument();

    // add second variant
    button.click();

    // UI allows to adjust percentages
    const matchedElements = await screen.findAllByText('Custom percentage');
    expect(matchedElements.length).toBe(2);

    // correct variants set on the parent
    await waitFor(() => {
        expect(currentStrategy).toMatchObject({
            ...initialStrategy,
            variants: [
                {
                    name: 'variantName',
                    payload: { type: 'string', value: 'variantValue' },
                    stickiness: 'clientId',
                    weight: 500,
                    weightType: 'variable',
                },
                {
                    name: '',
                    stickiness: 'clientId',
                    weight: 500,
                    weightType: 'variable',
                },
            ],
        });
    });
});
