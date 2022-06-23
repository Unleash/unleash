import { Store } from './store';

export interface IStrategy {
    name: string;
    editable: boolean;
    description: string;
    parameters: object[];
    deprecated: boolean;
    displayName: string;
}

export interface IEditableStrategy {
    name: string;
    description?: string;
    parameters: object;
    deprecated: boolean;
}

export interface IMinimalStrategy {
    name: string;
    description?: string;
    editable?: boolean;
    parameters?: any[];
}

export interface IMinimalStrategyRow {
    name: string;
    description?: string;
    editable?: boolean;
    parameters?: string;
}

export interface IStrategyStore extends Store<IStrategy, string> {
    getEditableStrategies(): Promise<IEditableStrategy[]>;
    createStrategy(update: IMinimalStrategy): Promise<void>;
    updateStrategy(update: IMinimalStrategy): Promise<void>;
    deprecateStrategy({ name }: Pick<IStrategy, 'name'>): Promise<void>;
    reactivateStrategy({ name }: Pick<IStrategy, 'name'>): Promise<void>;
    importStrategy(data: IMinimalStrategy): Promise<void>;
    dropCustomStrategies(): Promise<void>;
}
