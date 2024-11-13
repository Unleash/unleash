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
    milestones: IReleasePlanMilestone[];
}

export interface IReleasePlanMilestone {
    id: string;
    name: string;
}

export interface IReleasePlanTemplatePayload {
    id?: string;
    name: string;
    description: string;
    milestones?: IReleasePlanMilestone[];
}
