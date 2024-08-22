import type { IUiConfig } from 'interfaces/uiConfig';

export const defaultValue: IUiConfig = {
    name: 'Unleash',
    version: '5.x',
    slogan: 'The enterprise ready feature flag service.',
    flags: {
        P: false,
        RE: false,
        EEA: false,
        SE: false,
        T: false,
        UNLEASH_CLOUD: false,
        UG: false,
    },
    links: [
        {
            value: 'Documentation',
            icon: 'library_books',
            href: 'https://docs.getunleash.io/docs?source=oss',
            title: 'User documentation',
        },
        {
            value: 'GitHub',
            icon: 'c_github',
            href: 'https://github.com/Unleash',
            title: 'Source code on GitHub',
        },
    ],
    networkViewEnabled: false,
    resourceLimits: {
        segmentValues: 1000,
        strategySegments: 5,
        signalEndpoints: 5,
        actionSetActions: 10,
        actionSetsPerProject: 5,
        actionSetFilters: 5,
        actionSetFilterValues: 25,
        signalTokensPerEndpoint: 5,
        featureEnvironmentStrategies: 30,
        environments: 50,
        constraintValues: 250,
        constraints: 30,
        projects: 500,
        segments: 300,
        apiTokens: 2000,
        featureFlags: 5000,
    },
};
