import type { ReleasePlanMilestone } from './release-plan-milestone.js';

export interface ReleasePlan {
    id: string;
    discriminator: 'plan';
    name: string;
    description?: string | null;
    featureName: string;
    environment: string;
    createdByUserId: number;
    createdAt: Date;
    activeMilestoneId?: string;
    milestones: ReleasePlanMilestone[];
    releasePlanTemplateId: string;
}
