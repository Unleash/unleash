import {
    advancedPlaygroundViewModel,
    playgroundViewModel,
} from './playground-view-model';

describe('playground result to view model', () => {
    it('adds edit links to playground models', () => {
        const input = {
            environment: 'development',
            projects: '*' as '*',
            context: { appName: 'playground', userId: '1' },
        };
        const featureResult = {
            isEnabled: false,
            isEnabledInCurrentEnvironment: false,
            strategies: {
                result: false,
                data: [
                    {
                        name: 'flexibleRollout',
                        id: 'ea2c22c1-07fc-4cbe-934d-ffff57cd774b',
                        disabled: false,
                        parameters: {
                            groupId: 'test-playground',
                            rollout: '32',
                            stickiness: 'default',
                        },
                        result: {
                            enabled: false,
                            evaluationStatus: 'complete' as 'complete',
                        },
                        constraints: [],
                        segments: [],
                    },
                ],
            },
            projectId: 'default',
            variant: {
                name: 'disabled',
                enabled: false,
            },
            name: 'test-playground',
            variants: [],
        };

        const viewModel = playgroundViewModel(input, [featureResult]);
        const transformedStrategy = viewModel.features[0].strategies.data[0];

        // check that we're adding links correctly
        expect(transformedStrategy).toMatchObject({
            links: {
                edit:
                    expect.stringMatching(
                        `/projects/${featureResult.projectId}/features/${featureResult.name}/strategies/edit?`,
                    ) &&
                    expect.stringMatching(`environmentId=development`) &&
                    expect.stringMatching(
                        `strategyId=${transformedStrategy.id}`,
                    ),
            },
        });

        // check that we're not changing anything else
        expect(viewModel).toMatchObject({ input, features: [featureResult] });
    });

    it('adds edit links to advanced playground models', () => {
        const input = {
            environments: ['development'],
            projects: '*' as '*',
            context: { appName: 'playground', userId: '1' },
        };

        const featureResult = {
            name: 'test-playground',
            projectId: 'default',
            environments: {
                development: [
                    {
                        isEnabled: false,
                        isEnabledInCurrentEnvironment: true,
                        strategies: {
                            result: false,
                            data: [
                                {
                                    name: 'flexibleRollout',
                                    id: '2a7dfda6-acf1-4e53-8813-6559e8bd66b0',
                                    disabled: false,
                                    parameters: {
                                        groupId: 'test-playground',
                                        rollout: '50',
                                        stickiness: 'default',
                                    },
                                    result: {
                                        enabled: false,
                                        evaluationStatus:
                                            'complete' as 'complete',
                                    },
                                    constraints: [],
                                    segments: [],
                                },
                            ],
                        },
                        projectId: 'default',
                        variant: {
                            name: 'disabled',
                            enabled: false,
                        },
                        name: 'test-playground',
                        environment: 'development',
                        context: {
                            appName: 'playground',
                            userId: '1',
                        },
                        variants: [],
                    },
                ],
            },
        };

        const viewModel = advancedPlaygroundViewModel(input, [featureResult]);
        const transformedStrategy =
            viewModel.features[0].environments.development[0].strategies
                .data[0];

        // ensure that we're adding the required data
        expect(transformedStrategy).toMatchObject({
            links: {
                edit:
                    expect.stringMatching(
                        `/projects/${featureResult.projectId}/features/${featureResult.name}/strategies/edit?`,
                    ) &&
                    expect.stringMatching(`environmentId=development`) &&
                    expect.stringMatching(
                        `strategyId=${transformedStrategy.id}`,
                    ),
            },
        });

        // check that we're not changing anything else
        expect(viewModel).toMatchObject({ input, features: [featureResult] });
    });
});
