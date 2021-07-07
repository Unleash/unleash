export interface IFeatureToggleListItem {
    type: string;
    name: string;
    environments: IEnvironments[];
}

export interface IEnvironments {
    name: string;
    displayName: string;
    enabled: boolean;
}
