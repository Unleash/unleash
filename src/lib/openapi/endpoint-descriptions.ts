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
    },
} as const;
