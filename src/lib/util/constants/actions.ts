import {
    ActionDefinitionParameter,
    toggleFeatureParameters,
} from './action-parameters';

export type ActionDefinition = {
    label: string;
    description?: string;
    category?: string;
    permissions: string[];
    parameters: ActionDefinitionParameter[];
};

export const ACTIONS = new Map<string, ActionDefinition>([
    [
        'TOGGLE_FEATURE_ON',
        {
            label: 'Enable feature toggle',
            description: 'Enables a feature toggle for a specific environment.',
            category: 'Feature toggles',
            permissions: ['UPDATE_FEATURE_ENVIRONMENT'],
            parameters: toggleFeatureParameters,
        },
    ],
    [
        'TOGGLE_FEATURE_OFF',
        {
            label: 'Disable feature toggle',
            description:
                'Disables a feature toggle for a specific environment.',
            category: 'Feature toggles',
            permissions: ['UPDATE_FEATURE_ENVIRONMENT'],
            parameters: toggleFeatureParameters,
        },
    ],
]);
