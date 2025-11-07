import type { ReleasePlanMilestone } from './release-plan-milestone.js';

export type DisableReleasePlanAction = {
    type: 'disableReleasePlan';
    id: string;
};

export type SafeguardAction = DisableReleasePlanAction;

export interface SafeguardImpactMetric {
    id: string;
    metricName: string;
    timeRange: 'hour' | 'day' | 'week' | 'month';
    aggregationMode: 'rps' | 'count' | 'avg' | 'sum' | 'p95' | 'p99' | 'p50';
    labelSelectors: Record<string, string[]>;
}

export interface ThresholdCondition {
    operator: '>' | '<' | '>=' | '<=' | '==' | '!=';
    threshold: number;
}

export interface Safeguard {
    id: string;
    action: SafeguardAction;
    impactMetric: SafeguardImpactMetric;
    triggerCondition: ThresholdCondition;
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
