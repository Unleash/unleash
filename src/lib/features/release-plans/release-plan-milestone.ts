import type { ReleasePlanMilestoneStrategy } from './release-plan-milestone-strategy';

export interface ReleasePlanMilestone {
    id: string;
    name: string;
    sortOrder: number;
    releasePlanDefinitionId: string;
    strategies?: ReleasePlanMilestoneStrategy[];
}
