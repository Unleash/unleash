import { formatUpdateStrategyApiCode } from 'component/feature/FeatureStrategy/FeatureStrategyEdit/FeatureStrategyEdit';
import { IFeatureStrategy, IStrategy } from 'interfaces/strategy';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import { Route, Routes } from 'react-router-dom';

import {
    CREATE_FEATURE_STRATEGY,
    UPDATE_FEATURE_ENVIRONMENT_VARIANTS,
    UPDATE_FEATURE_STRATEGY,
} from 'component/providers/AccessProvider/permissions';
import { FeatureStrategyEdit } from './FeatureStrategyEdit';
import {
    setupContextEndpoint,
    setupFeaturesEndpoint,
    setupProjectEndpoint,
    setupSegmentsEndpoint,
    setupStrategyEndpoint,
    setupUiConfigEndpoint,
} from '../FeatureStrategyCreate/featureStrategyFormTestSetup';
import userEvent from '@testing-library/user-event';

const featureName = 'my-new-feature';
const variantName = 'Blue';

const setupComponent = () => {
    return {
        wrapper: render(
            <Routes>
                <Route
                    path={
                        '/projects/:projectId/features/:featureId/strategies/edit'
                    }
                    element={<FeatureStrategyEdit />}
                />
            </Routes>,
            {
                route: `/projects/default/features/${featureName}/strategies/edit?environmentId=development&strategyId=1`,
                permissions: [
                    {
                        permission: CREATE_FEATURE_STRATEGY,
                        project: 'default',
                        environment: 'development',
                    },
                    {
                        permission: UPDATE_FEATURE_STRATEGY,
                        project: 'default',
                        environment: 'development',
                    },
                    {
                        permission: UPDATE_FEATURE_ENVIRONMENT_VARIANTS,
                        project: 'default',
                        environment: 'development',
                    },
                ],
            },
        ),
        expectedGroupId: 'newGroupId',
        expectedVariantName: variantName,
        expectedSliderValue: '75',
    };
};

beforeEach(() => {
    setupProjectEndpoint();
    setupSegmentsEndpoint();
    setupStrategyEndpoint();
    setupFeaturesEndpoint(featureName, variantName);
    setupUiConfigEndpoint();
    setupContextEndpoint();
});

describe('NewFeatureStrategyEdit', () => {
    test('formatUpdateStrategyApiCode', () => {
        const strategy: IFeatureStrategy = {
            id: 'a',
            name: 'b',
            parameters: {
                c: 1,
                b: 2,
                a: 3,
            },
            constraints: [],
        };

        const strategyDefinition: IStrategy = {
            name: 'c',
            displayName: 'd',
            description: 'e',
            editable: false,
            deprecated: false,
            parameters: [
                { name: 'a', description: '', type: '', required: false },
                { name: 'b', description: '', type: '', required: false },
                { name: 'c', description: '', type: '', required: false },
            ],
        };

        expect(
            formatUpdateStrategyApiCode(
                'projectId',
                'featureId',
                'environmentId',
                'strategyId',
                strategy,
                strategyDefinition,
                'unleashUrl',
            ),
        ).toMatchInlineSnapshot(`
      "curl --location --request PUT 'unleashUrl/api/admin/projects/projectId/features/featureId/environments/environmentId/strategies/strategyId' \\
          --header 'Authorization: INSERT_API_KEY' \\
          --header 'Content-Type: application/json' \\
          --data-raw '{
        "id": "a",
        "name": "b",
        "parameters": {
          "a": 3,
          "b": 2,
          "c": 1
        },
        "constraints": []
      }'"
    `);
    });

    test('should change general settings', async () => {
        const { expectedGroupId, expectedSliderValue, wrapper } =
            setupComponent();

        await waitFor(() => {
            expect(screen.getByText('Gradual rollout')).toBeInTheDocument();
        });

        const slider = await screen.findByRole('slider', { name: /rollout/i });
        const groupIdInput = await screen.getByLabelText('groupId');

        expect(slider).toHaveValue('50');
        expect(groupIdInput).toHaveValue(featureName);
        const defaultStickiness = await screen.findByText('default');
        userEvent.click(defaultStickiness);
        const randomStickiness = await screen.findByText('random');
        userEvent.click(randomStickiness);

        fireEvent.change(slider, { target: { value: expectedSliderValue } });
        fireEvent.change(groupIdInput, { target: { value: expectedGroupId } });

        expect(slider).toHaveValue(expectedSliderValue);
        expect(groupIdInput).toHaveValue(expectedGroupId);

        await waitFor(() => {
            const codeSnippet = document.querySelector('pre')?.innerHTML;
            const count = (codeSnippet!.match(/random/g) || []).length;
            // strategy stickiness and variant stickiness
            expect(count).toBe(2);
        });
    });

    test('should not change variant names', async () => {
        const { expectedVariantName } = setupComponent();

        await waitFor(() => {
            expect(screen.getByText('Gradual rollout')).toBeInTheDocument();
        });

        const variantsEl = screen.getByText('Variants');
        fireEvent.click(variantsEl);

        expect(screen.getByText(expectedVariantName)).toBeInTheDocument();

        const inputElement = screen.getAllByRole('textbox')[0];
        expect(inputElement).toBeDisabled();
    });
});
