import { ITagType } from './tags';

export interface IAddon {
    id: number;
    provider: string;
    description: string;
    enabled: boolean;
    events: string[];
    parameters: object;
}

export interface IAddonProvider {
    description: string;
    displayName: string;
    documentationUrl: string;
    events: string[];
    name: string;
    parameters: IAddonProviderParams[];
    tagTypes: ITagType[];
}

export interface IAddonProviderParams {
    name: string;
    displayName: string;
    type: string;
    required: boolean;
    sensitive: boolean;
    placeholder?: string;
    description?: string;
}

export interface IAddonConfig {
    description: string;
    enabled: boolean;
    events: string[];
    id: number;
    parameters: Record<string, any>;
    provider: string;
}
