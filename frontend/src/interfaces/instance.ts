type InstancePrices = {
    pro?: {
        base?: number;
        seat?: number;
        traffic?: number;
    };
    payg?: {
        seat?: number;
        traffic?: number;
    };
};

type InstanceBilling = 'pay-as-you-go' | 'subscription';

export interface IInstanceStatus {
    plan: InstancePlan;
    trialExpiry?: string;
    trialStart?: string;
    trialExtended?: number;
    billingCenter?: string;
    state?: InstanceState;
    seats?: number;
    minSeats?: number;
    isCustomBilling?: boolean;
    prices?: InstancePrices;
    billing?: InstanceBilling;
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
    ENTERPRISE = 'Enterprise',
    UNKNOWN = 'Unknown',
}
