import type { ReleasePlanMilestone } from './release-plan-milestone.js';

export interface ReleasePlanTemplate {
    id: string;
    discriminator: 'template';
    name: string;
    description?: string | null;
    project?: string | null; // TODO: can we drop ? and be nullable
    createdByUserId: number;
    createdAt: Date;
    milestones?: ReleasePlanMilestone[];
    archivedAt?: Date;
}
