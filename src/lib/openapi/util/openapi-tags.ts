// The "official" OpenAPI tags that we use. These tags are added to the OpenAPI
// spec as the root-level "tags" list. Consider creating a new entry here when
// creating a new endpoint.
const OPENAPI_TAGS = [
    {
        name: 'Addons',
        description:
            'Create, update, and delete [Unleash addons](https://docs.getunleash.io/addons).',
    },
    { name: 'Admin UI', description: 'Configure the Unleash Admin UI.' },
    {
        name: 'API tokens',
        description:
            'Create, update, and delete [Unleash API tokens](https://docs.getunleash.io/reference/api-tokens-and-client-keys).',
    },
    {
        name: 'Archive',
        description:
            'Revive or permanently delete [archived feature toggles](https://docs.getunleash.io/advanced/archived_toggles).',
    },
    { name: 'Auth', description: 'Manage logins, passwords, etc.' },
    {
        name: 'Client',
        description:
            'Endpoints for [Unleash server-side clients](https://docs.getunleash.io/sdks).',
    },
    {
        name: 'Context',
        description:
            'Create, update, and delete [context fields](https://docs.getunleash.io/user_guide/unleash_context) that Unleash is aware of.',
    },
    {
        name: 'Environments',
        description:
            'Create, update, delete, enable or disable [environments](https://docs.getunleash.io/user_guide/environments) for this Unleash instance.',
    },
    { name: 'Events', description: 'Read events from this Unleash instance.' },
    {
        name: 'Features',
        description:
            'Create, update, and delete [features toggles](https://docs.getunleash.io/reference/feature-toggles).',
    },
    {
        name: 'Import/Export',
        description:
            '[Import and export](https://docs.getunleash.io/deploy/import_export) the state of your Unleash instance.',
    },
    {
        name: 'Metrics',
        description: 'Register, read, or delete metrics recorded by Unleash.',
    },
    {
        name: 'Operational',
        description:
            'Endpoints related to the operational status of this Unleash instance.',
    },
    {
        name: 'Playground',
        description:
            'Evaluate an Unleash context against your feature toggles.',
    },
    {
        name: 'Projects',
        description:
            'Create, update, and delete [Unleash projects](https://docs.getunleash.io/user_guide/projects).',
    },
    {
        name: 'Public signup tokens',
        description:
            'Create, update, and delete [Unleash Public Signup tokens](https://docs.getunleash.io/reference/public-signup-tokens).',
    },
    {
        name: 'Strategies',
        description:
            'Create, update, delete, manage [custom strategies](https://docs.getunleash.io/advanced/custom_activation_strategy).',
    },
    {
        name: 'Tags',
        description:
            'Create, update, and delete [tags and tag types](https://docs.getunleash.io/advanced/tags).',
    },
    { name: 'Users', description: 'Manage users and passwords.' },
    {
        name: 'Unstable',
        description:
            'Experimental endpoints that may change or disappear at any time.',
    },
    { name: 'Edge', description: 'Endpoints related to Unleash on the Edge.' },
] as const;

// make the export mutable, so it can be used in a schema
export const openApiTags = [...OPENAPI_TAGS].sort((a, b) =>
    a.name.localeCompare(b.name),
);

export type OpenApiTag =
    // The official OpenAPI tags that we use.
    typeof OPENAPI_TAGS[number]['name'];
