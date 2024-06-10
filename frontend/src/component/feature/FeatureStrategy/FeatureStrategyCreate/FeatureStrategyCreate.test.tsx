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

        const titleEl = await screen.findByText('Gradual rollout');
        expect(titleEl).toBeInTheDocument();

        const targetingEl = screen.getByText('Targeting');
        fireEvent.click(targetingEl);

        const addConstraintEl = await screen.findByText('Add constraint');
        fireEvent.click(addConstraintEl);

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

        const inputElement = screen.getByPlaceholderText(
            'value1, value2, value3...',
        );
        fireEvent.change(inputElement, {
            target: { value: expectedMultipleValues },
        });

        const addValueEl = await screen.findByText('Add values');
        fireEvent.click(addValueEl);

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

        const inputElements = screen.getAllByPlaceholderText(
            'value1, value2, value3...',
        );

        fireEvent.change(inputElements[0], {
            target: { value: '123' },
        });
        fireEvent.change(inputElements[1], {
            target: { value: '456' },
        });
        fireEvent.change(inputElements[2], {
            target: { value: '789' },
        });

        const addValueEls = await screen.findAllByText('Add values');
        fireEvent.click(addValueEls[0]);
        fireEvent.click(addValueEls[1]);
        fireEvent.click(addValueEls[2]);

        expect(screen.queryByText('123')).toBeInTheDocument();
        const deleteBtns = await screen.findAllByTestId('CancelIcon');
        fireEvent.click(deleteBtns[0]);

        expect(screen.queryByText('123')).not.toBeInTheDocument();
        expect(screen.queryByText('456')).toBeInTheDocument();
        expect(screen.queryByText('789')).toBeInTheDocument();
    });

    test('Should update multiple constraints with the correct react key', async () => {
        setupComponent();

        const titleEl = await screen.findByText('Gradual rollout');
        expect(titleEl).toBeInTheDocument();

        const targetingEl = screen.getByText('Targeting');
        fireEvent.click(targetingEl);

        const addConstraintEl = await screen.findByText('Add constraint');
        fireEvent.click(addConstraintEl);
        fireEvent.click(addConstraintEl);
        fireEvent.click(addConstraintEl);

        const inputElements = screen.getAllByPlaceholderText(
            'value1, value2, value3...',
        );

        fireEvent.change(inputElements[0], {
            target: { value: '123' },
        });
        fireEvent.change(inputElements[1], {
            target: { value: '456' },
        });
        fireEvent.change(inputElements[2], {
            target: { value: '789' },
        });

        const addValueEls = await screen.findAllByText('Add values');
        fireEvent.click(addValueEls[0]);
        fireEvent.click(addValueEls[1]);
        fireEvent.click(addValueEls[2]);

        expect(screen.queryByText('123')).toBeInTheDocument();

        const deleteBtns = screen.getAllByTestId('DELETE_CONSTRAINT_BUTTON');
        fireEvent.click(deleteBtns[0]);

        const inputElements2 = screen.getAllByPlaceholderText(
            'value1, value2, value3...',
        );

        fireEvent.change(inputElements2[0], {
            target: { value: '666' },
        });
        const addValueEls2 = screen.getAllByText('Add values');
        fireEvent.click(addValueEls2[0]);

        expect(screen.queryByText('123')).not.toBeInTheDocument();
        expect(screen.queryByText('456')).toBeInTheDocument();
        expect(screen.queryByText('789')).toBeInTheDocument();
    });

    test('Should undo changes made to constraints', async () => {
        setupComponent();

        const titleEl = await screen.findByText('Gradual rollout');
        expect(titleEl).toBeInTheDocument();

        const targetingEl = screen.getByText('Targeting');
        fireEvent.click(targetingEl);

        const addConstraintEl = await screen.findByText('Add constraint');
        fireEvent.click(addConstraintEl);

        const inputEl = screen.getByPlaceholderText(
            'value1, value2, value3...',
        );

        fireEvent.change(inputEl, {
            target: { value: '6, 7, 8' },
        });

        const addBtn = await screen.findByText('Add values');
        addBtn.click();

        expect(screen.queryByText('6')).toBeInTheDocument();
        expect(screen.queryByText('7')).toBeInTheDocument();
        expect(screen.queryByText('8')).toBeInTheDocument();

        const undoBtn = await screen.findByTestId(
            'UNDO_CONSTRAINT_CHANGE_BUTTON',
        );
        undoBtn.click();

        expect(screen.queryByText('6')).not.toBeInTheDocument();
        expect(screen.queryByText('7')).not.toBeInTheDocument();
        expect(screen.queryByText('8')).not.toBeInTheDocument();
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
