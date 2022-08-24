export interface IInstanceStatus {
    plan: InstancePlan;
    trialExpiry?: string;
    trialStart?: string;
    trialExtended?: number;
    billingCenter?: string;
    state?: InstanceState;
    seats?: number;
}

export enum InstanceState {
    UNASSIGNED = 'UNASSIGNED',
    TRIAL = 'TRIAL',
    ACTIVE = 'ACTIVE',
    EXPIRED = 'EXPIRED',
    CHURNED = 'CHURNED',
}

export enum InstancePlan {
    PRO = 'Pro',
    COMPANY = 'Company',
    TEAM = 'Team',
    UNKNOWN = 'Unknown',
}
