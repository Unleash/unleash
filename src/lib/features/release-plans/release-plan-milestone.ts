import type { ReleasePlanMilestoneStrategy } from './release-plan-milestone-strategy.js';

export interface ReleasePlanMilestone {
    id: string;
    name: string;
    sortOrder: number;
    releasePlanDefinitionId: string;
    startedAt?: Date;
    transitionCondition?: object;
    strategies?: ReleasePlanMilestoneStrategy[];
}
