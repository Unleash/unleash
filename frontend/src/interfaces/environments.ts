export interface IEnvironment {
    name: string;
    type: string;
    createdAt: string;
    sortOrder: number;
    enabled: boolean;
    protected: boolean;
}

export interface IEnvironmentPayload {
    name: string;
    type: string;
}

export interface IEnvironmentEditPayload {
    sortOrder: number;
    type: string;
}

export interface IEnvironmentResponse {
    environments: IEnvironment[];
}

export interface ISortOrderPayload {
    [index: string]: number;
}

export interface IEnvironmentMetrics {
    name: string;
    yes: number;
    no: number;
    timestamp: string;
}
