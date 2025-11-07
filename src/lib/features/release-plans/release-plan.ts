import type { ReleasePlanMilestone } from './release-plan-milestone.js';

export interface Safeguard {
    id: string;
    impactMetricId: string;
    action: unknown;
    triggerCondition: unknown;
}

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
    safeguards?: Safeguard[];
    milestones: ReleasePlanMilestone[];
    releasePlanTemplateId: string;
}
