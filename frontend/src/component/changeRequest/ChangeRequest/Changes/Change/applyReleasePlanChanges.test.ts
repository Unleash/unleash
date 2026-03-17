import { applyProgressionChanges } from './applyReleasePlanChanges';
import type { IReleasePlan } from 'interfaces/releasePlans';
import type {
    IChangeRequestChangeMilestoneProgression,
    IChangeRequestDeleteMilestoneProgression,
    IChangeRequestUpdateMilestoneStrategy,
} from 'component/changeRequest/changeRequest.types';

const basePlan: IReleasePlan = {
    id: 'plan-1',
    name: 'Test Plan',
    description: '',
    createdAt: '2024-01-01',
    createdByUserId: 1,
    featureName: 'test-flag',
    environment: 'production',
    safeguards: [],
    milestones: [
        {
            id: 'milestone-1',
            name: 'Milestone 1',
            releasePlanDefinitionId: 'def-1',
            transitionCondition: { intervalMinutes: 60 },
            strategies: [
                {
                    id: 'strategy-1',
                    milestoneId: 'milestone-1',
                    name: 'flexibleRollout',
                    parameters: { rollout: '50' },
                    constraints: [],
                    segments: [],
                    variants: [],
                    disabled: false,
                    sortOrder: 0,
                },
            ],
        },
    ],
};

const strategyChange: IChangeRequestUpdateMilestoneStrategy = {
    id: 1,
    action: 'updateMilestoneStrategy' as const,
    payload: {
        id: 'strategy-1',
        parameters: { rollout: '75' },
        constraints: [],
        segments: [],
        variants: [],
        disabled: false,
        snapshot: {
            id: 'strategy-1',
            name: 'flexibleRollout',
            parameters: { rollout: '50' },
            constraints: [],
            segments: [],
            variants: [],
            disabled: false,
            sortOrder: 0,
        },
    },
};

describe('applying strategy changes', () => {
    it.each([
        {
            when: 'deleting a progression',
            progressionChanges: [
                {
                    id: 2,
                    action: 'deleteMilestoneProgression' as const,
                    payload: { sourceMilestone: 'milestone-1' },
                },
            ],
            expectedTransitionCondition: null,
        },
        {
            when: 'changing a progression',
            progressionChanges: [
                {
                    id: 3,
                    action: 'changeMilestoneProgression' as const,
                    payload: {
                        sourceMilestone: 'milestone-1',
                        targetMilestone: 'milestone-2',
                        transitionCondition: { intervalMinutes: 120 },
                    },
                },
            ],
            expectedTransitionCondition: { intervalMinutes: 120 },
        },
        {
            when: "the progression doesn't change",
            progressionChanges: [] as (
                | IChangeRequestChangeMilestoneProgression
                | IChangeRequestDeleteMilestoneProgression
            )[],
            expectedTransitionCondition:
                basePlan.milestones[0].transitionCondition,
        },
    ])('should apply strategy and progression changes correctly when $when', ({
        progressionChanges,
        expectedTransitionCondition,
    }) => {
        const result = applyProgressionChanges(basePlan, [
            ...progressionChanges,
            strategyChange,
        ]);

        const updatedStrategy = result.milestones[0].strategies[0];
        expect(updatedStrategy).not.toHaveProperty('snapshot');

        const { snapshot: _, ...expectedState } = strategyChange.payload;
        expect(updatedStrategy).toMatchObject(expectedState);

        expect(result.milestones).toMatchObject([
            {
                transitionCondition: expectedTransitionCondition,
                strategies: [expectedState],
            },
        ]);
    });
});
