import { formatAddStrategyApiCode } from 'component/feature/FeatureStrategy/FeatureStrategyCreate/FeatureStrategyCreate';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import { Route, Routes } from 'react-router-dom';

import {
    CREATE_FEATURE_STRATEGY,
    UPDATE_FEATURE_ENVIRONMENT_VARIANTS,
    UPDATE_FEATURE_STRATEGY,
} from 'component/providers/AccessProvider/permissions';
import { FeatureStrategyCreate } from './FeatureStrategyCreate';
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
                    element={<FeatureStrategyCreate />}
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

        const titleEl = await screen.findByText('Gradual rollout');
        expect(titleEl).toBeInTheDocument();
        const saveButton = await screen.findByText('Save strategy');
        expect(saveButton).not.toBeDisabled();

        const slider = await screen.findByRole('slider', { name: /rollout/i });
        expect(slider).toHaveValue('100');

        const targetingEl = screen.getByText('Targeting');
        fireEvent.click(targetingEl);

        const segmentsEl = await screen.findByText('Segments');
        expect(segmentsEl).toBeInTheDocument();

        const variantEl = screen.getByText('Variants');
        fireEvent.click(variantEl);

        const addVariantEl = await screen.findByText('Add variant');
        expect(addVariantEl).toBeInTheDocument();
    });

    test('should change general settings', async () => {
        const { expectedGroupId, expectedSliderValue } = setupComponent();

        const titleEl = await screen.findByText('Gradual rollout');
        expect(titleEl).toBeInTheDocument();

        const slider = await screen.findByRole('slider', { name: /rollout/i });
        const groupIdInput = await screen.findByLabelText('groupId');

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

        const titleEl = await screen.findByText('Gradual rollout');
        expect(titleEl).toBeInTheDocument();

        const targetingEl = screen.getByText('Targeting');
        fireEvent.click(targetingEl);

        const addConstraintEl = await screen.findByText('Add constraint');
        fireEvent.click(addConstraintEl);

        const popoverOpenButton = screen.getByRole('button', {
            name: 'Add values',
        });
        fireEvent.click(popoverOpenButton);

        const popoverInput = screen.getByRole('textbox', {
            name: 'Constraint Value',
        });
        fireEvent.change(popoverInput, {
            target: { value: expectedConstraintValue },
        });

        const addButton = screen.getByRole('button', {
            name: 'Add',
        });
        fireEvent.click(addButton);

        const selectElement = screen.getByPlaceholderText('Select segments');
        fireEvent.mouseDown(selectElement);

        const optionElement = await screen.findByText(expectedSegmentName);
        fireEvent.click(optionElement);

        expect(screen.getByText(expectedSegmentName)).toBeInTheDocument();
        expect(screen.getByText(expectedConstraintValue)).toBeInTheDocument();
    }, 10000);

    test('should change variants settings', async () => {
        const { expectedVariantName } = setupComponent();

        const titleEl = await screen.findByText('Gradual rollout');
        expect(titleEl).toBeInTheDocument();

        const variantsEl = screen.getByText('Variants');
        fireEvent.click(variantsEl);

        const addVariantEl = await screen.findByText('Add variant');
        fireEvent.click(addVariantEl);

        const inputElement = screen.getAllByRole('textbox')[0];
        fireEvent.change(inputElement, {
            target: { value: expectedVariantName },
        });

        expect(screen.getByText(expectedVariantName)).toBeInTheDocument();

        const generalSettingsEl = screen.getByText('General');
        fireEvent.click(generalSettingsEl);

        await waitFor(() => {
            const codeSnippet = document.querySelector('pre')?.innerHTML;
            const variantNameMatches = (
                codeSnippet!.match(new RegExp(expectedVariantName, 'g')) || []
            ).length;
            const metaDataMatches = (codeSnippet!.match(/isValid/g) || [])
                .length;
            expect(variantNameMatches).toBe(1);
            expect(metaDataMatches).toBe(0);
        });
    });

    test('should change variant name after changing tab', async () => {
        const { expectedVariantName } = setupComponent();

        const titleEl = await screen.findByText('Gradual rollout');
        expect(titleEl).toBeInTheDocument();

        const variantsEl = screen.getByText('Variants');
        fireEvent.click(variantsEl);

        const addVariantEl = await screen.findByText('Add variant');
        fireEvent.click(addVariantEl);

        const inputElement = screen.getAllByRole('textbox')[0];
        fireEvent.change(inputElement, {
            target: { value: expectedVariantName },
        });

        const targetingEl = await screen.findByText('Targeting');
        fireEvent.click(targetingEl);

        const addConstraintEl = await screen.findByText('Add constraint');
        expect(addConstraintEl).toBeInTheDocument();

        fireEvent.click(variantsEl);
        const inputElement2 = screen.getAllByRole('textbox')[0];

        expect(inputElement2).not.toBeDisabled();
    });

    test('should remove empty variants when changing tabs', async () => {
        setupComponent();

        const titleEl = await screen.findByText('Gradual rollout');
        expect(titleEl).toBeInTheDocument();

        const variantsEl = screen.getByText('Variants');
        fireEvent.click(variantsEl);

        const addVariantEl = await screen.findByText('Add variant');
        fireEvent.click(addVariantEl);

        const variants = screen.queryAllByTestId('VARIANT');
        expect(variants.length).toBe(1);

        const targetingEl = await screen.findByText('Targeting');
        fireEvent.click(targetingEl);

        const addConstraintEl = await screen.findByText('Add constraint');
        expect(addConstraintEl).toBeInTheDocument();

        fireEvent.click(variantsEl);

        const variants2 = screen.queryAllByTestId('VARIANT');
        expect(variants2.length).toBe(0);
    });

    test('Should autosave constraint settings when navigating between tabs', async () => {
        const { expectedMultipleValues } = setupComponent();

        const titleEl = await screen.findByText('Gradual rollout');
        expect(titleEl).toBeInTheDocument();

        const targetingEl = screen.getByText('Targeting');
        fireEvent.click(targetingEl);

        const addConstraintEl = await screen.findByText('Add constraint');
        fireEvent.click(addConstraintEl);

        const popoverOpenButton = screen.getByRole('button', {
            name: 'Add values',
        });
        fireEvent.click(popoverOpenButton);

        const popoverInput = screen.getByRole('textbox', {
            name: 'Constraint Value',
        });
        fireEvent.change(popoverInput, {
            target: { value: expectedMultipleValues },
        });
        const addButton = screen.getByRole('button', {
            name: 'Add',
        });
        fireEvent.click(addButton);
        fireEvent.keyPress(popoverInput, { key: 'Escape' });

        const variantsEl = screen.getByText('Variants');
        fireEvent.click(variantsEl);

        fireEvent.click(targetingEl);

        const values = expectedMultipleValues.split(',');

        expect(screen.getByText(values[0])).toBeInTheDocument();
        expect(screen.getByText(values[1])).toBeInTheDocument();
        expect(screen.getByText(values[2])).toBeInTheDocument();
    });

    test('Should update multiple constraints correctly', async () => {
        setupComponent();

        const titleEl = await screen.findByText('Gradual rollout');
        expect(titleEl).toBeInTheDocument();

        const targetingEl = screen.getByText('Targeting');
        fireEvent.click(targetingEl);

        const addConstraintEl = await screen.findByText('Add constraint');
        fireEvent.click(addConstraintEl);
        fireEvent.click(addConstraintEl);
        fireEvent.click(addConstraintEl);

        const popoverOpenButtons = screen.getAllByRole('button', {
            name: 'Add values',
        });

        const values = ['123', '456', '789'];
        for (const [index, popoverOpenButton] of popoverOpenButtons.entries()) {
            fireEvent.click(popoverOpenButton);

            const popoverInput = screen.getByRole('textbox', {
                name: 'Constraint Value',
            });
            fireEvent.change(popoverInput, {
                target: { value: values[index] },
            });
            const addButton = screen.getByRole('button', {
                name: 'Add',
            });
            fireEvent.click(addButton);
            fireEvent.keyPress(popoverInput, { key: 'Escape' });
        }

        expect(screen.queryByText('123')).toBeInTheDocument();
        expect(screen.queryByText('456')).toBeInTheDocument();
        expect(screen.queryByText('789')).toBeInTheDocument();

        const deleteBtns = await screen.findAllByTestId(
            'DELETE_CONSTRAINT_BUTTON',
        );
        fireEvent.click(deleteBtns[0]);
        screen.debug(undefined, 200000);

        expect(screen.queryByText('123')).not.toBeInTheDocument();
        expect(screen.queryByText('456')).toBeInTheDocument();
        expect(screen.queryByText('789')).toBeInTheDocument();
    });

    test('Should remove constraint when no valid values are set and moving between tabs', async () => {
        setupComponent();

        const titleEl = await screen.findByText('Gradual rollout');
        expect(titleEl).toBeInTheDocument();

        const targetingEl = screen.getByText('Targeting');
        fireEvent.click(targetingEl);

        const addConstraintEl = await screen.findByText('Add constraint');
        fireEvent.click(addConstraintEl);

        const variantsEl = screen.getByText('Variants');
        fireEvent.click(variantsEl);
        fireEvent.click(targetingEl);

        const seconAddConstraintEl = await screen.findByText('Add constraint');

        expect(seconAddConstraintEl).toBeInTheDocument();
        expect(screen.queryByText('appName')).not.toBeInTheDocument();
    });
});
