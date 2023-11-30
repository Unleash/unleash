// The "official" OpenAPI tags that we use. These tags are added to the OpenAPI
// spec as the root-level "tags" list. Consider creating a new entry here when
// creating a new endpoint. This list should always be sorted alphabetically on
// the tag name.
const OPENAPI_TAGS = [
    {
        name: 'Addons',
        description:
            'Create, update, and delete [Unleash addons](https://docs.getunleash.io/addons).',
    },
    {
        name: 'Admin UI',
        description:
            'Configuration for the Unleash Admin UI. These endpoints should not be relied upon and can change at any point without prior notice.',
    },
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
        name: 'Banners',
        description:
            'Create, update, toggle, and delete [banners](https://docs.getunleash.io/reference/banners).',
    },
    {
        name: 'Change Requests',
        description:
            'API for managing [change requests](https://docs.getunleash.io/reference/change-requests).',
    },
    {
        name: 'Client',
        description:
            'Endpoints for [Unleash server-side clients](https://docs.getunleash.io/reference/sdks).',
    },
    {
        name: 'Context',
        description:
            'Create, update, and delete [context fields](https://docs.getunleash.io/reference/unleash-context) that Unleash is aware of.',
    },
    {
        name: 'Dependencies',
        description: 'Manage feature dependencies.',
    },
    { name: 'Edge', description: 'Endpoints related to Unleash on the Edge.' },
    {
        name: 'Environments',
        description:
            'Create, update, delete, enable or disable [environments](https://docs.getunleash.io/reference/environments) for this Unleash instance.',
    },
    { name: 'Events', description: 'Read events from this Unleash instance.' },
    {
        name: 'Feature Types',
        description:
            'Manage [feature toggle types](https://docs.getunleash.io/reference/feature-toggle-types).',
    },
    {
        name: 'Features',
        description:
            'Create, update, and delete [features toggles](https://docs.getunleash.io/reference/feature-toggles).',
    },
    {
        name: 'Frontend API',
        description:
            'API for connecting client-side (frontend) applications to Unleash.',
    },
    {
        name: 'Import/Export',
        description:
            '[Import and export](https://docs.getunleash.io/deploy/import_export) the state of your Unleash instance.',
    },
    {
        name: 'Instance Admin',
        description:
            'Instance admin endpoints used to manage the Unleash instance itself.',
    },
    {
        name: 'Maintenance',
        description: 'Enable/disable the maintenance mode of Unleash.',
    },
    {
        name: 'Metrics',
        description: 'Register, read, or delete metrics recorded by Unleash.',
    },
    {
        name: 'Notifications',
        description:
            'API for managing [notifications](https://docs.getunleash.io/reference/notifications).',
    },
    {
        name: 'Operational',
        description:
            'Endpoints related to the operational status of this Unleash instance.',
    },
    {
        name: 'Personal access tokens',
        description:
            'Create, update, and delete [Personal access tokens](https://docs.getunleash.io/reference/api-tokens-and-client-keys#personal-access-tokens).',
    },
    {
        name: 'Playground',
        description:
            'Evaluate an Unleash context against your feature toggles.',
    },
    {
        name: 'Projects',
        description:
            'Create, update, and delete [Unleash projects](https://docs.getunleash.io/reference/projects).',
    },
    {
        name: 'Public signup tokens',
        description:
            'Create, update, and delete [Unleash Public Signup tokens](https://docs.getunleash.io/reference/public-signup-tokens).',
    },
    { name: 'Search', description: 'Search for features.' },
    {
        name: 'Segments',
        description:
            'Create, update, delete, and manage [segments](https://docs.getunleash.io/reference/segments).',
    },
    {
        name: 'Service Accounts',
        description:
            'Endpoints for managing [Service Accounts](https://docs.getunleash.io/reference/service-accounts), which enable programmatic access to the Unleash API.',
    },
    {
        name: 'Strategies',
        description:
            'Create, update, delete, manage [custom strategies](https://docs.getunleash.io/reference/custom-activation-strategies).',
    },
    {
        name: 'Tags',
        description:
            'Create, update, and delete [tags and tag types](https://docs.getunleash.io/reference/tags).',
    },
    {
        name: 'Telemetry',
        description: 'API for information about telemetry collection',
    },
    {
        name: 'Unstable',
        description:
            'Experimental endpoints that may change or disappear at any time.',
    },
    { name: 'Users', description: 'Manage users and passwords.' },
] as const;

// make the export mutable, so it can be used in a schema
export const openApiTags = [...OPENAPI_TAGS];

export type OpenApiTag =
    // The official OpenAPI tags that we use.
    (typeof OPENAPI_TAGS)[number]['name'];
