import type { IFeatureStrategy } from './strategy.js';
import type { MetricQuerySchemaTimeRange } from 'openapi/models/metricQuerySchemaTimeRange';
import type { MetricQuerySchemaAggregationMode } from 'openapi/models/metricQuerySchemaAggregationMode';
import type { SafeguardTriggerConditionSchemaOperator } from 'openapi/models/safeguardTriggerConditionSchemaOperator';

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
}

export interface ISafeguard {
    id: string;
    impactMetric: {
        aggregationMode: MetricQuerySchemaAggregationMode;
        metricName: string;
        timeRange: MetricQuerySchemaTimeRange;
        labelSelectors: { appName: [string] };
    };
    triggerCondition: {
        operator: SafeguardTriggerConditionSchemaOperator;
        threshold: number;
    };
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
    transitionCondition?: {
        intervalMinutes: number;
    } | null;
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
