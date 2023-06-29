export const endpointDescriptions = {
    admin: {
        events: {
            description:
                'Returns **the last 100** events from the Unleash instance when called without a query parameter. When called with a `project` parameter, returns **all events** for the specified project.\n\nIf the provided project does not exist, the list of events will be empty.',
            summary:
                'Get the most recent events from the Unleash instance or all events related to a project.',
        },
        eventsPerFeature: {
            description:
                'Returns all events related to the specified feature toggle. If the feature toggle does not exist, the list of events will be empty.',
            summary: 'Get all events related to a specific feature toggle.',
        },
        playground: {
            description:
                'Use the provided `context`, `environment`, and `projects` to evaluate toggles on this Unleash instance. Returns a list of all toggles that match the parameters and what they evaluate to. The response also contains the input parameters that were provided.',
            summary:
                'Evaluate an Unleash context against a set of environments and projects.',
        },
        advancedPlayground: {
            description:
                'Use the provided `context`, `environments`, and `projects` to evaluate toggles on this Unleash instance. You can use comma-separated values to provide multiple values to each context field. Returns a combinatorial list of all toggles that match the parameters and what they evaluate to. The response also contains the input parameters that were provided.',
            summary:
                'Batch evaluate an Unleash context against a set of environments and projects.',
        },
        export: {
            description:
                'Exports all features listed in the `features` property from the environment specified in the request body. If set to `true`, the `downloadFile` property will let you download a file with the exported data. Otherwise, the export data is returned directly as JSON. Refer to the documentation for more information about [Unleash's export functionality](https://docs.getunleash.io/reference/deploy/environment-import-export#export).',
            summary:
                'Export feature toggles from an environment',
        },
        validateImport: {
            summary:
                'Validate feature import data'
            description: `Validates a feature toggle data set. Checks whether the data can be imported into the specified project and environment. The returned value is an object that contains errors, warnings, and permissions required to perform the import, as described in the [import documentation](https://docs.getunleash.io/reference/deploy/environment-import-export#import).`,
        },
        import: {
            summary: 'Import feature toggles'
            description: `[Import feature toggles](https://docs.getunleash.io/reference/deploy/environment-import-export#import) into a specific project and environment.`,
        },
    },
} as const;
