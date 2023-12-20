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
import { testServerRoute, testServerSetup } from 'utils/testServer';

const server = testServerSetup();

const featureName = 'my-new-feature';

const setupProjectEndpoint = () => {
    testServerRoute(server, '/api/admin/projects/default', {
        environments: [
            {
                name: 'development',
                enabled: true,
                type: 'development',
            },
        ],
    });
};

const setupSegmentsEndpoint = () => {
    testServerRoute(server, '/api/admin/segments', {
        segments: [
            {
                name: 'test',
                constraints: [],
            },
        ],
    });
};

const setupStrategyEndpoint = () => {
    testServerRoute(server, '/api/admin/strategies/flexibleRollout', {
        displayName: 'Gradual rollout',
        name: 'flexibleRollout',
        parameters: [
            {
                name: 'rollout',
            },
            {
                name: 'stickiness',
            },
            {
                name: 'groupId',
            },
        ],
    });
};

const setupFeaturesEndpoint = () => {
    testServerRoute(
        server,
        `/api/admin/projects/default/features/${featureName}`,
        {
            environments: [
                {
                    name: 'development',
                    type: 'development',
                },
            ],
            name: featureName,
            project: 'default',
        },
    );
};

const setupUiConfigEndpoint = () => {
    testServerRoute(server, '/api/admin/ui-config', {
        versionInfo: {
            current: {
                enterprise: '5.7.0-main',
            },
        },
        environment: 'enterprise',
        flags: {
            newStrategyConfiguration: true,
        },
    });
};

const setupContextEndpoint = () => {
    testServerRoute(server, '/api/admin/context', [
        {
            name: 'appName',
        },
    ]);
};

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
    };
};

beforeEach(() => {
    setupProjectEndpoint();
    setupSegmentsEndpoint();
    setupStrategyEndpoint();
    setupFeaturesEndpoint();
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
      "curl --location --request POST 'unleashUrl/api/admin/projects/projectId/features/featureId/environments/environmentId/strategies' \\\\
          --header 'Authorization: INSERT_API_KEY' \\\\
          --header 'Content-Type: application/json' \\\\
          --data-raw '{
        \\"id\\": \\"strategyId\\"
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

        const selectElement = screen.getByPlaceholderText('Add Segments');
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
});
