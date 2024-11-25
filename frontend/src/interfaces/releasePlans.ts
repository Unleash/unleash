import type { IFeatureVariant } from './featureToggle';
import type { IConstraint, IFeatureStrategyParameters } from './strategy';

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

export interface IReleasePlanMilestoneStrategy {
    id: string;
    name: string;
    title: string;
    disabled?: boolean;
    constraints: IConstraint[];
    parameters: IFeatureStrategyParameters;
    variants?: IFeatureVariant[];
}

export interface IReleasePlanMilestone {
    id: string;
    name: string;
}

export interface IReleasePlanTemplatePayload {
    id?: string;
    name: string;
    description: string;
    milestones?: IReleasePlanMilestonePayload[];
}

export interface IReleasePlanMilestonePayload {
    id?: string;
    name: string;
    sortOrder: number;
    strategies?: IReleasePlanStrategyPayload[];
}

export interface IReleasePlanStrategyPayload {
    id?: string;
    name: string;
}
