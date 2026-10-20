import { expect, test } from 'vitest';
import type { IFeatureToggle } from 'interfaces/featureToggle';
import type { IFeatureStrategy } from 'interfaces/strategy';
import { strategyComparisonModerator } from './featureStrategy.utils';

const strategy = (id: string, rollout = '50'): IFeatureStrategy => ({
    id,
    name: 'flexibleRollout',
    constraints: [],
    parameters: { rollout },
});

const feature = ({
    strategies = [strategy('strategy')],
    milestoneStrategies = [] as IFeatureStrategy[],
    lastSeenAt = '2026-10-19T10:00:00.000Z',
}): IFeatureToggle =>
    ({
        name: 'flag',
        lastSeenAt,
        environments: [
            {
                name: 'development',
                strategies,
                releasePlans: [
                    {
                        milestones: [{ strategies: milestoneStrategies }],
                    },
                ],
            },
            { name: 'production', strategies: [strategy('other')] },
        ],
    }) as unknown as IFeatureToggle;

test('the staleness comparison only sees the strategy being edited, including milestone strategies', () => {
    const editingStrategy = strategyComparisonModerator(
        'development',
        'strategy',
    );
    const editingMilestone = strategyComparisonModerator(
        'development',
        'milestone-strategy',
    );

    const before = feature({
        milestoneStrategies: [strategy('milestone-strategy')],
    });
    const flagLevelChange = feature({
        milestoneStrategies: [strategy('milestone-strategy')],
        lastSeenAt: '2026-10-19T10:00:05.000Z',
    });
    const strategyChanged = feature({
        strategies: [strategy('strategy', '75')],
        milestoneStrategies: [strategy('milestone-strategy')],
    });
    const milestoneChanged = feature({
        milestoneStrategies: [strategy('milestone-strategy', '75')],
    });

    expect(editingStrategy(flagLevelChange)).toEqual(editingStrategy(before));

    expect(editingStrategy(strategyChanged)).not.toEqual(
        editingStrategy(before),
    );
    expect(editingMilestone(milestoneChanged)).not.toEqual(
        editingMilestone(before),
    );
    expect(editingStrategy(milestoneChanged)).toEqual(editingStrategy(before));
});
