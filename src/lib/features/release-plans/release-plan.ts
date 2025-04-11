import type { ReleasePlanMilestone } from './release-plan-milestone';

export interface ReleasePlan {
    id: string;
    discriminator: 'plan';
    name: string;
    description?: string | null;
    featureName: string;
    environment: string;
    createdByUserId: number;
    createdAt: string;
    activeMilestoneId?: string;
    milestones: ReleasePlanMilestone[];
    releasePlanTemplateId: string;
}
