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
