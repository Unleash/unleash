export interface IInstanceStatus {
    plan: string;
    trialExpiry?: string;
    trialStart?: string;
    trialExtended?: number;
    billingCenter?: string;
    state?: InstanceState;
}

export enum InstanceState {
    UNASSIGNED = 'UNASSIGNED',
    TRIAL = 'TRIAL',
    ACTIVE = 'ACTIVE',
    EXPIRED = 'EXPIRED',
    CHURNED = 'CHURNED',
}
