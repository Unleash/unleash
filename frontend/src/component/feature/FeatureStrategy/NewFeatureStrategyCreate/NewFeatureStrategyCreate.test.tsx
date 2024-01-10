import { formatAddStrategyApiCode } from 'component/feature/FeatureStrategy/FeatureStrategyCreate/FeatureStrategyCreate';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import { Route, Routes } from 'react-router-dom';

import {
    CREATE_FEATURE_STRATEGY,
    UPDATE_FEATURE_ENVIRONMENT_VARIANTS,
    UPDATE_FEATURE_STRATEGY,
} from 'component/providers/AccessProvider/permissions';
import { NewFeatureStrategyCreate } from './NewFeatureStrategyCreate';
import {
    setupProjectEndpoint,
    setupSegmentsEndpoint,
    setupStrategyEndpoint,
    setupFeaturesEndpoint,
    setupUiConfigEndpoint,
    setupContextEndpoint,
} from './featureStrategyFormTestSetup';

const featureName = 'my-new-feature';

const setupComponent = () => {
    return {
        wrapper: render(
            <Routes>
                <Route
                    path={
                        '/projects/:projectId/features/:featureId/strategies/create'
                    }
                    element={<NewFeatureStrategyCreate />}
                />
            </Routes>,
            {
                route: `/projects/default/features/${featureName}/strategies/create?environmentId=development&strategyName=flexibleRollout&defaultStrategy=true`,
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
        expectedSegmentName: 'test',
        expectedGroupId: 'newGroupId',
        expectedVariantName: 'Blue',
        expectedSliderValue: '50',
        expectedConstraintValue: 'new value',
        expectedMultipleValues: '1234,4141,51515',
    };
};

beforeEach(() => {
    setupProjectEndpoint();
    setupSegmentsEndpoint();
    setupStrategyEndpoint();
    setupFeaturesEndpoint(featureName);
    setupUiConfigEndpoint();
    setupContextEndpoint();
});

describe('NewFeatureStrategyCreate', () => {
    test('formatAddStrategyApiCode', () => {
        expect(
            formatAddStrategyApiCode(
                'projectId',
                'featureId',
                'environmentId',
                { id: 'strategyId' },
                'unleashUrl',
            ),
        ).toMatchInlineSnapshot(`
          "curl --location --request POST 'unleashUrl/api/admin/projects/projectId/features/featureId/environments/environmentId/strategies' \\
              --header 'Authorization: INSERT_API_KEY' \\
              --header 'Content-Type: application/json' \\
              --data-raw '{
            "id": "strategyId"
          }'"
        `);
    });

    test('should navigate tabs', async () => {
        setupComponent();

        await waitFor(() => {
            expect(screen.getByText('Gradual rollout')).toBeInTheDocument();
        });

        const slider = await screen.findByRole('slider', { name: /rollout/i });
        expect(slider).toHaveValue('100');

        const targetingEl = screen.getByText('Targeting');
        fireEvent.click(targetingEl);

        await waitFor(() => {
            expect(screen.getByText('Segments')).toBeInTheDocument();
        });

        const variantEl = screen.getByText('Variants');
        fireEvent.click(variantEl);

        await waitFor(() => {
            expect(screen.getByText('Add variant')).toBeInTheDocument();
        });
    });

    test('should change general settings', async () => {
        const { expectedGroupId, expectedSliderValue } = setupComponent();

        await waitFor(() => {
            expect(screen.getByText('Gradual rollout')).toBeInTheDocument();
        });

        const slider = await screen.findByRole('slider', { name: /rollout/i });
        const groupIdInput = await screen.getByLabelText('groupId');

        expect(slider).toHaveValue('100');
        expect(groupIdInput).toHaveValue(featureName);

        fireEvent.change(slider, { target: { value: expectedSliderValue } });
        fireEvent.change(groupIdInput, { target: { value: expectedGroupId } });

        expect(slider).toHaveValue(expectedSliderValue);
        expect(groupIdInput).toHaveValue(expectedGroupId);
    });

    test('should change targeting settings', async () => {
        const { expectedConstraintValue, expectedSegmentName } =
            setupComponent();

        await waitFor(() => {
            expect(screen.getByText('Gradual rollout')).toBeInTheDocument();
        });

        const targetingEl = screen.getByText('Targeting');
        fireEvent.click(targetingEl);

        await waitFor(() => {
            const addConstraintEl = screen.getByText('Add constraint');
            fireEvent.click(addConstraintEl);
        });

        const inputElement = screen.getByPlaceholderText(
            'value1, value2, value3...',
        );
        fireEvent.change(inputElement, {
            target: { value: expectedConstraintValue },
        });

        const addValueEl = screen.getByText('Add values');
        fireEvent.click(addValueEl);

        const doneEl = screen.getByText('Done');
        fireEvent.click(doneEl);

        const selectElement = screen.getByPlaceholderText('Select segments');
        fireEvent.mouseDown(selectElement);

        const optionElement = await screen.findByText(expectedSegmentName);
        fireEvent.click(optionElement);

        expect(screen.getByText(expectedSegmentName)).toBeInTheDocument();
        expect(screen.getByText(expectedConstraintValue)).toBeInTheDocument();
    });

    test('should change variants settings', async () => {
        const { expectedVariantName } = setupComponent();

        await waitFor(() => {
            expect(screen.getByText('Gradual rollout')).toBeInTheDocument();
        });

        const variantsEl = screen.getByText('Variants');
        fireEvent.click(variantsEl);

        await waitFor(() => {
            const addVariantEl = screen.getByText('Add variant');
            fireEvent.click(addVariantEl);
        });

        const inputElement = screen.getAllByRole('textbox')[0];
        fireEvent.change(inputElement, {
            target: { value: expectedVariantName },
        });

        expect(screen.getByText(expectedVariantName)).toBeInTheDocument();
    });

    test('should change variant name after changing tab', async () => {
        const { expectedVariantName } = setupComponent();

        await waitFor(() => {
            expect(screen.getByText('Gradual rollout')).toBeInTheDocument();
        });

        const variantsEl = screen.getByText('Variants');
        fireEvent.click(variantsEl);

        await waitFor(() => {
            const addVariantEl = screen.getByText('Add variant');
            fireEvent.click(addVariantEl);
        });

        await waitFor(() => {
            const targetingEl = screen.getByText('Targeting');
            fireEvent.click(targetingEl);
        });

        await waitFor(() => {
            const addConstraintEl = screen.getByText('Add constraint');
            expect(addConstraintEl).toBeInTheDocument();
        });

        fireEvent.click(variantsEl);

        const inputElement = screen.getAllByRole('textbox')[0];
        fireEvent.change(inputElement, {
            target: { value: expectedVariantName },
        });

        expect(screen.getByText(expectedVariantName)).toBeInTheDocument();
    });

    test('Should autosave constraint settings when navigating between tabs', async () => {
        const { expectedMultipleValues } = setupComponent();

        await waitFor(() => {
            expect(screen.getByText('Gradual rollout')).toBeInTheDocument();
        });

        const targetingEl = screen.getByText('Targeting');
        fireEvent.click(targetingEl);

        await waitFor(() => {
            const addConstraintEl = screen.getByText('Add constraint');
            fireEvent.click(addConstraintEl);
        });

        const inputElement = screen.getByPlaceholderText(
            'value1, value2, value3...',
        );
        fireEvent.change(inputElement, {
            target: { value: expectedMultipleValues },
        });

        await waitFor(() => {
            const addValueEl = screen.getByText('Add values');
            fireEvent.click(addValueEl);
        });

        const variantsEl = screen.getByText('Variants');
        fireEvent.click(variantsEl);

        fireEvent.click(targetingEl);

        const values = expectedMultipleValues.split(',');

        expect(screen.getByText(values[0])).toBeInTheDocument();
        expect(screen.getByText(values[1])).toBeInTheDocument();
        expect(screen.getByText(values[2])).toBeInTheDocument();
    });

    test('Should remove constraint when no valid values are set and moving between tabs', async () => {
        setupComponent();

        await waitFor(() => {
            expect(screen.getByText('Gradual rollout')).toBeInTheDocument();
        });

        const targetingEl = screen.getByText('Targeting');
        fireEvent.click(targetingEl);

        await waitFor(() => {
            const addConstraintEl = screen.getByText('Add constraint');
            fireEvent.click(addConstraintEl);
        });

        const variantsEl = screen.getByText('Variants');
        fireEvent.click(variantsEl);
        fireEvent.click(targetingEl);

        expect(screen.queryByText('appName')).not.toBeInTheDocument();
    });
});
