import type { ReleasePlanMilestone } from './release-plan-milestone.js';

export interface ReleasePlanTemplate {
    id: string;
    discriminator: 'template';
    name: string;
    description?: string | null;
    createdByUserId: number;
    createdAt: string;
    milestones?: ReleasePlanMilestone[];
    archivedAt?: string;
}
