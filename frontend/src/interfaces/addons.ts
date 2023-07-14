import { ITagType } from './tags';

export interface IAddon {
    provider: string;
    parameters: Record<string, any>;
    id: number;
    events: string[];
    projects?: string[];
    environments?: string[];
    enabled: boolean;
    description: string;
}

export interface IAddonProvider {
    description: string;
    displayName: string;
    documentationUrl: string;
    events: string[];
    name: string;
    parameters: IAddonProviderParams[];
    tagTypes: ITagType[];
    installation?: IAddonInstallation;
    alerts?: IAddonAlert[];
    deprecated?: string;
}

export interface IAddonInstallation {
    url: string;
    warning?: string;
    title?: string;
    helpText?: string;
}

export interface IAddonAlert {
    type: 'success' | 'info' | 'warning' | 'error';
    text: string;
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
    provider: string;
    parameters: Record<string, any>;
    id: number;
    events: string[];
    projects?: string[];
    environments?: string[];
    enabled: boolean;
    description: string;
}
