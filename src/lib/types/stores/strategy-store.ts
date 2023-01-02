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

export interface IStrategyImport {
    name: string;
    description?: string;
    deprecated?: boolean;
    parameters?: object[];
    builtIn?: boolean;
    sortOrder?: number;
    displayName?: string;
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
    importStrategy(data: IStrategyImport): Promise<void>;
    dropCustomStrategies(): Promise<void>;
    count(): Promise<number>;
}
