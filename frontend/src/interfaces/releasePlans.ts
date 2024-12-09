import type { IFeatureStrategy } from './strategy';

export interface IReleasePlanTemplate {
    id: string;
    name: string;
    description: string;
    createdAt: string;
    createdByUserId: number;
}

export interface IReleasePlanTemplate {
    id: string;
    name: string;
    description: string;
    createdAt: string;
    createdByUserId: number;
    milestones: IReleasePlanMilestonePayload[];
}

export interface IReleasePlan {
    id: string;
    name: string;
    description: string;
    createdAt: string;
    createdByUserId: number;
    activeMilestoneId?: string;
    featureName: string;
    environment: string;
    milestones: IReleasePlanMilestone[];
}

export interface IReleasePlanMilestone {
    id: string;
    name: string;
    releasePlanDefinitionId: string;
    strategies: IReleasePlanMilestoneStrategy[];
}

export interface IReleasePlanMilestoneStrategy extends IFeatureStrategy {
    milestoneId: string;
}

export interface IReleasePlanTemplatePayload {
    name: string;
    description: string;
    milestones: IReleasePlanMilestonePayload[];
}

export interface IReleasePlanMilestonePayload {
    id: string;
    name: string;
    sortOrder: number;
    strategies?: Omit<IReleasePlanMilestoneStrategy, 'milestoneId'>[];
}
