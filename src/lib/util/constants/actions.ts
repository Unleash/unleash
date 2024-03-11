type ActionDefinition = {
    label: string;
    permissions: string[];
    required: string[];
};

export const ACTIONS = new Map<string, ActionDefinition>([
    [
        'TOGGLE_FEATURE_ON',
        {
            label: 'Enable flag',
            permissions: ['UPDATE_FEATURE_ENVIRONMENT'],
            required: ['project', 'environment', 'featureName'],
        },
    ],
    [
        'TOGGLE_FEATURE_OFF',
        {
            label: 'Disable flag',
            permissions: ['UPDATE_FEATURE_ENVIRONMENT'],
            required: ['project', 'environment', 'featureName'],
        },
    ],
]);
