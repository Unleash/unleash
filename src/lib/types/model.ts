export interface IConstraint {
    contextName: string;
    operator: string;
    values: string[];
}

export interface IStrategyConfig {
    id: string;
    name: string;
    constraints: IConstraint[];
    parameters: Object;
}
