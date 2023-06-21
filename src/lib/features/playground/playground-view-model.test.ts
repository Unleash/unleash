import {
    addStrategyEditLink,
    advancedPlaygroundViewModel,
    buildStrategyLink,
    playgroundViewModel,
} from './playground-view-model';

describe('strategy link building', () => {
    it('builds strategy edit links correctly', () => {
        const project = 'project-name';
        const environment = 'env-name';
        const feature = 'feature-name';
        const strategy = 'C38DE36B-7CC4-42A0-BF4F-AD7F62894B42';

        const link = buildStrategyLink(project, feature, environment, strategy);
        expect(link).toMatch(
            `/projects/${project}/features/${feature}/strategies/edit?`,
        );

        expect(link).toMatch(`environmentId=${environment}`);
        expect(link).toMatch(`strategyId=${strategy}`);
    });

    it('adds edit links to each strategy', () => {
        const strategy = {
            id: '5A416B60-64BB-4C0E-AEEA-0C3803945D17',
            name: 'gradualRollout',
            result: {
                evaluationStatus: 'complete' as 'complete',
                enabled: true,
            },
            segments: [],
            constraints: [],
            parameters: {},
            disabled: false,
        };

        const result = addStrategyEditLink('env', 'proj', 'feat', strategy);
        expect(result).toMatchObject({
            ...strategy,
            links: {
                edit:
                    expect.stringMatching(
                        `/projects/proj/features/feat/strategies/edit?`,
                    ) &&
                    expect.stringMatching(`environmentId=env`) &&
                    expect.stringMatching(`strategyId=${strategy.id}`),
            },
        });
    });
});

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
    });
});
