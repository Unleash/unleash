import { screen } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import React from 'react';
import { PlaygroundFeatureSchema, PlaygroundRequestSchema } from '../../../../../../openapi';
import { PlaygroundResultFeatureStrategyList } from './PlaygroundResultFeatureStrategyList';

test('Environment not enabled and parent dependency not satisfied', async () => {
    render(
        <PlaygroundResultFeatureStrategyList
            feature={
                {
                    strategies: {
                        result: true,
                        data: [{name: 'default', parameters: {}, result: {enabled: true, evaluationStatus: 'complete'}}]
                    },
                    isEnabledInCurrentEnvironment: false,
                    hasUnsatisfiedDependency: true
                } as PlaygroundFeatureSchema
            }
            input={{ environment: 'development' } as PlaygroundRequestSchema}
        />,
    );

    await screen.findByText(
        'If environment was enabled and parent dependencies were satisfied, then this feature toggle would be TRUE with strategies evaluated like so:',
    );
});

test('Environment enabled and parent dependency not satisfied', async () => {
    render(
        <PlaygroundResultFeatureStrategyList
            feature={
                {
                    strategies: {
                        result: true,
                        data: [{name: 'default', parameters: {}, result: {enabled: true, evaluationStatus: 'complete'}}]
                    },
                    isEnabledInCurrentEnvironment: true,
                    hasUnsatisfiedDependency: true
                } as PlaygroundFeatureSchema
            }
            input={{ environment: 'development' } as PlaygroundRequestSchema}
        />,
    );

    await screen.findByText(
        'If parent dependencies were satisfied, then this feature toggle would be TRUE with strategies evaluated like so:',
    );
});

test('Environment not enabled and parent dependency satisfied', async () => {
    render(
        <PlaygroundResultFeatureStrategyList
            feature={
                {
                    strategies: {
                        result: true,
                        data: [{name: 'default', parameters: {}, result: {enabled: true, evaluationStatus: 'complete'}}]
                    },
                    isEnabledInCurrentEnvironment: false,
                    hasUnsatisfiedDependency: false
                } as PlaygroundFeatureSchema
            }
            input={{ environment: 'development' } as PlaygroundRequestSchema}
        />,
    );

    await screen.findByText(
        'If environment was enabled, then this feature toggle would be TRUE with strategies evaluated like so:',
    );
});
