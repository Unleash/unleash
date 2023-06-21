import {
    addStrategyEditLink,
    buildStrategyLink,
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
