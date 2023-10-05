import { screen } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import React from 'react';
import { FeatureDetails } from './FeatureDetails';
import {
    PlaygroundFeatureSchema,
    PlaygroundRequestSchema,
} from 'openapi';

test('Feature has unsatisfied parent dependency and feature environment is disabled', async () => {
    render(
        <FeatureDetails
            feature={
                {
                    hasUnsatisfiedDependency: true,
                    isEnabledInCurrentEnvironment: false,
                } as PlaygroundFeatureSchema
            }
            input={{ environment: 'development' } as PlaygroundRequestSchema}
            onClose={() => {}}
        />,
    );

    await screen.findByText(
        'This feature toggle is False in development because',
    );
    await screen.findByText(
        'parent dependency is not satisfied and the environment is disabled',
    );
});

test('Feature has unsatisfied parent dependency', async () => {
    render(
        <FeatureDetails
            feature={
                {
                    hasUnsatisfiedDependency: true,
                    isEnabledInCurrentEnvironment: true,
                } as PlaygroundFeatureSchema
            }
            input={{ environment: 'development' } as PlaygroundRequestSchema}
            onClose={() => {}}
        />,
    );

    await screen.findByText(
        'This feature toggle is False in development because',
    );
    await screen.findByText('parent dependency is not satisfied');
});

test('Feature environment is disabled', async () => {
    render(
        <FeatureDetails
            feature={
                {
                    hasUnsatisfiedDependency: false,
                    isEnabledInCurrentEnvironment: false,
                } as PlaygroundFeatureSchema
            }
            input={{ environment: 'development' } as PlaygroundRequestSchema}
            onClose={() => {}}
        />,
    );

    await screen.findByText(
        'This feature toggle is False in development because',
    );
    await screen.findByText('the environment is disabled');
});

test('Feature environment is enabled', async () => {
    render(
        <FeatureDetails
            feature={
                {
                    isEnabled: true,
                } as PlaygroundFeatureSchema
            }
            input={{ environment: 'development' } as PlaygroundRequestSchema}
            onClose={() => {}}
        />,
    );

    await screen.findByText(
        'This feature toggle is True in development because',
    );
    await screen.findByText('at least one strategy is True');
});

test('Feature has only custom strategies', async () => {
    render(
        <FeatureDetails
            feature={
                {
                    isEnabledInCurrentEnvironment: true,
                    strategies: {
                        data: [{ name: 'custom' }],
                    },
                } as PlaygroundFeatureSchema
            }
            input={{ environment: 'development' } as PlaygroundRequestSchema}
            onClose={() => {}}
        />,
    );

    await screen.findByText(
        'This feature toggle is Unknown in development because',
    );
    await screen.findByText('no strategies could be fully evaluated');
});

test('Feature has some custom strategies', async () => {
    render(
        <FeatureDetails
            feature={
                {
                    isEnabledInCurrentEnvironment: true,
                    strategies: {
                        data: [{ name: 'custom' }, { name: 'default' }],
                    },
                } as PlaygroundFeatureSchema
            }
            input={{ environment: 'development' } as PlaygroundRequestSchema}
            onClose={() => {}}
        />,
    );

    await screen.findByText(
        'This feature toggle is Unknown in development because',
    );
    await screen.findByText('not all strategies could be fully evaluated');
});

test('Feature has all strategies evaluating to false', async () => {
    render(
        <FeatureDetails
            feature={
                {
                    isEnabledInCurrentEnvironment: true,
                    strategies: {
                        data: [{ name: 'default' }],
                    },
                } as PlaygroundFeatureSchema
            }
            input={{ environment: 'development' } as PlaygroundRequestSchema}
            onClose={() => {}}
        />,
    );

    await screen.findByText(
        'This feature toggle is False in development because',
    );
    await screen.findByText(
        'all strategies are either False or could not be fully evaluated',
    );
});
