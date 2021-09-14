export interface IStrategy {
    constraints: IConstraint[];
    id: string;
    name: string;
    parameters: IParameter;
}

export interface IConstraint {
    values: string[];
    operator: string;
    contextName: string;
}

export interface IParameter {
    groupId?: string;
    rollout?: number;
    stickiness?: string;
    [index: string]: any;
}
