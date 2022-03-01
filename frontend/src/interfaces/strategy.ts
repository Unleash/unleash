export interface IFeatureStrategy {
    id: string;
    name: string;
    constraints: IConstraint[];
    parameters: IParameter;
}

export interface IStrategy {
    name: string;
    displayName: string;
    editable: boolean;
    deprecated: boolean;
    description: string;
    parameters: IParameter[];
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

export interface IStrategyPayload {
    name?: string;
    constraints: IConstraint[];
    parameters: IParameter;
}
