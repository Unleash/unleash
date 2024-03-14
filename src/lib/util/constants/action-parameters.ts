type ActionDefinitionParameterType =
    | 'project'
    | 'featureToggle'
    | 'environment';

export type ActionDefinitionParameter = {
    name: string;
    label: string;
    type: ActionDefinitionParameterType;
    hidden?: boolean;
    optional?: boolean;
};

const projectParameter: ActionDefinitionParameter = {
    name: 'project',
    label: 'Project',
    type: 'project',
    hidden: true,
};

const featureToggleParameter: ActionDefinitionParameter = {
    name: 'featureName',
    label: 'Feature toggle',
    type: 'featureToggle',
};

const environmentParameter: ActionDefinitionParameter = {
    name: 'environment',
    label: 'Environment',
    type: 'environment',
};

export const toggleFeatureParameters = [
    projectParameter,
    featureToggleParameter,
    environmentParameter,
];
