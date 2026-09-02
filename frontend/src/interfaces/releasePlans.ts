import type {
    TransitionConditionSchema,
    TransitionConditionSchemaOneOf,
} from 'openapi';
import type { IFeatureStrategy } from './strategy.ts';
import type { ISafeguard } from './safeguard.ts';

export type TimeTransitionCondition = TransitionConditionSchemaOneOf;
export type ExposureTransitionCondition = Exclude<
    TransitionConditionSchema,
    TimeTransitionCondition
>;

export const isTimeCondition = (
    condition: TransitionConditionSchema,
): condition is TimeTransitionCondition =>
    condition.type === undefined || condition.type === 'time';

export const isExposureCondition = (
    condition: TransitionConditionSchema,
): condition is ExposureTransitionCondition => condition.type === 'exposure';

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
    archivedAt?: string;
    project?: string | null;
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
    safeguards: ISafeguard[];
}

export interface IReleasePlanMilestone {
    id: string;
    name: string;
    releasePlanDefinitionId: string;
    strategies: IReleasePlanMilestoneStrategy[];
    startedAt?: string | null;
    pausedAt?: string | null;
    transitionCondition?: TransitionConditionSchema | null;
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
    transitionCondition?: TransitionConditionSchema;
}
