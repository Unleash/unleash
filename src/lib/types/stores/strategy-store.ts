import type { CreateStrategySchema } from '../../openapi/index.js';
import type { Store } from './store.js';

export interface IStrategy {
    name: string;
    editable: boolean;
    description: string;
    parameters: object[];
    deprecated: boolean;
    displayName: string;
    title?: string;
}

export interface IEditableStrategy {
    name: string;
    description?: string;
    parameters: object;
    deprecated: boolean;
    title?: string;
}

export type IMinimalStrategy = Pick<
    CreateStrategySchema,
    'name' | 'description' | 'editable' | 'parameters' | 'title'
>;

export type IStrategyImport = Pick<
    CreateStrategySchema,
    | 'name'
    | 'description'
    | 'deprecated'
    | 'parameters'
    | 'builtIn'
    | 'sortOrder'
    | 'displayName'
    | 'title'
>;

export interface IMinimalStrategyRow {
    name: string;
    description?: string;
    editable?: boolean;
    parameters?: string;
    title?: string;
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
