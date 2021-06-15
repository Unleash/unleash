export interface IConstraint {
    contextName: string;
    operator: string;
    values: string[];
}

export interface IStrategyConfig {
    name: string;
    constraints: IConstraint[];
    parameters: Object;
}
