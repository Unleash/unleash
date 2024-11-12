export interface IReleasePlanTemplate {
    id: string;
    name: string;
    description: string;
    createdAt: string;
    createdByUserId: number;
}

export interface IReleasePlanTemplateInstance {
    id: string;
    name: string;
    description: string;
    createdAt: string;
    createdByUserId: number;
    milestones: IReleasePlanMilestoneInstance[];
}

export interface IReleasePlanMilestoneInstance {
    id: string;
    name: string;
}

export interface IReleasePlanTemplatePayload {
    id?: string;
    name: string;
    description: string;
    milestones?: IReleasePlanMilestoneInstance[];
}
