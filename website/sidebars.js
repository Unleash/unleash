/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */

        // TODO: Rewrite welcome page

        // TODO: Move legacy API docs to mention on API docs page
        // TODO: DELETE Reference documentation nav item
        // TODO: Add warning to legacy API docs


        // TODO: rename and reformat getting started (Quickstart)

        // TODO: Check SemRush for ranking keywords

        // TODO: Add video to upgraging unleash


        // PRs to be aware of:
        // https://github.com/Unleash/unleash/pull/5173



module.exports = {
    documentation: [
        'welcome',
        'tutorials/getting-started',
        {
            label: 'Unleash Academy',
            collapsed: false,
            type: 'category',
            link: {
                type: 'doc',
                id: 'tutorials/academy',
            },
            items: [
                'tutorials/academy-foundational',
                'tutorials/academy-advanced-for-devs',
                'tutorials/academy-managing-unleash-for-devops',
            ],
        },
        {
            label: 'Feature Flag Best Practices',
            collapsed: false,
            type: 'category',
            link: {
                type: 'generated-index',
                title: 'Feature Flag Best Practices',
                description: 'Principles and recommendations for best practices of using feature flags.',
                slug: '/topics',
            },
            items: [
                {
                    type: 'category',
                    label: '11 Principles for Building and Scaling Feature Flag Systems',
                    link: {
                        type: 'doc',
                        id: 'topics/feature-flags/feature-flag-best-practices',
                    },
                    items: [
                        'topics/feature-flags/runtime-control',
                        'topics/feature-flags/never-expose-pii',
                        'topics/feature-flags/evaluate-flags-close-to-user',
                        'topics/feature-flags/scale-horizontally',
                        'topics/feature-flags/limit-payloads',
                        'topics/feature-flags/availability-over-consistency',
                        'topics/feature-flags/short-lived-feature-flags',
                        'topics/feature-flags/unique-names',
                        'topics/feature-flags/democratize-feature-flag-access',
                        'topics/feature-flags/prioritize-ux',
                        'topics/feature-flags/enable-traceability',
                    ],
                },
                {
                    type: 'category',
                    label: 'Feature Flag Migrations',
                    link: {
                        type: 'doc',
                        id: 'topics/feature-flag-migration/feature-flag-migration-best-practices',
                    },
                    items: [
                        'topics/feature-flag-migration/feature-flag-migration-scope',
                        'topics/feature-flag-migration/business-case-feature-flag-migration',
                        'topics/feature-flag-migration/planning-feature-flag-migration',
                        'topics/feature-flag-migration/how-to-execute-feature-flag-migration',
                        'topics/feature-flag-migration/onbording-users-to-feature-flag-service',
                    ],
                },
                'topics/a-b-testing',
            ],
        },
        {
            label: 'Feature Flag Tutorials',
            type: 'category',
            collapsed: false,
            link: {
                type: 'generated-index',
                title: 'Feature Flag Tutorials',
                description: 'Tutorials to implement feature flags with your framework.',
                slug: 'feature-flag-tutorials',
            },
            items: [
                'feature-flag-tutorials/flutter/a-b-testing',
                'feature-flag-tutorials/nextjs/implementing-feature-flags',
            ],
        },
        {
            label: 'Understanding Unleash',
            collapsed: false,
            type: 'category',
            link: {
                type: 'generated-index',
                title: 'Understanding Unleash',
                description: 'Documentation on how Unleash works, high-level architecture and important concepts.',
                slug: 'understanding-unleash',
            },
            items: [
                'tutorials/unleash-overview',
                'topics/the-anatomy-of-unleash',
                'topics/managing-constraints',
                'topics/proxy-hosting',
                'topics/data-collection',
                {
                    type: 'category',
                    link: {
                        type: 'generated-index',
                        title: 'Unleash Concepts',
                        description:
                            'Documents describing the inner parts of Unleash.',
                        slug: '/reference/concepts',
                    },
                    label: 'Unleash Concepts',
                    items: [
                        'reference/activation-strategies',
                        'reference/api-tokens-and-client-keys',
                        'reference/archived-toggles',
                        'reference/event-log',
                        'reference/event-types',
                        'reference/impression-data',
                        'reference/custom-activation-strategies',
                        'reference/environments',
                        'reference/strategy-variants',
                        'reference/feature-flag-naming-patterns',
                        'reference/feature-toggles',
                        'reference/feature-toggle-types',
                        'reference/feature-toggle-variants',
                        'reference/front-end-api',
                        'reference/login-history',
                        'reference/maintenance-mode',
                        'reference/network-view',
                        'reference/notifications',
                        'reference/playground',
                        'reference/public-signup',
                        'reference/projects',
                        'reference/project-collaboration-mode',
                        'reference/rbac',
                        'reference/segments',
                        'reference/service-accounts',
                        'reference/sso',
                        'reference/stickiness',
                        'reference/strategy-constraints',
                        'reference/tags',
                        'reference/technical-debt',
                        'reference/unleash-context',
                        'reference/change-requests',
                        'reference/dependent-features',
                    ],
                },
            ],
        },
        {
            label: 'Using Unleash',
            collapsed: false,
            type: 'category',
            link: {
                type: 'generated-index',
                title: 'Using Unleash',
                description: 'Documentation on how to accomplish specific tasks when building with Unleash, including API and SDK documentation.',
                slug: '/using-unleash',
            },
            items: [
                {
                    label: 'APIs',
                    collapsed: true,
                    type: 'category',
                    link: {
                        title: 'Unleash Server APIs',
                        type: 'generated-index',
                        description:
                            'Generated API docs based on the Unleash OpenAPI schema.',
                        slug: '/reference/api/unleash',
                    },
                    items: [
                        require('./docs/reference/api/unleash/sidebar.js'),
                        {
                            'System API': [
                                'reference/api/legacy/unleash/internal/prometheus',
                                'reference/api/legacy/unleash/internal/health',
                            ],
                        },
                    ]
                },
                {
                    label: 'Application SDKs',
                    type: 'category',
                    link: { type: 'doc', id: 'reference/sdks/index' },
                    items: [
                        {
                            type: 'category',
                            label: 'Server-side SDKs',
                            items: [
                                {
                                    type: 'autogenerated',
                                    dirName: 'generated/sdks/server-side',
                                },
                            ],
                        },
                        {
                            type: 'category',
                            label: 'Client-side SDKs',
                            items: [
                                {
                                    type: 'autogenerated',
                                    dirName: 'generated/sdks/client-side',
                                },
                            ],
                        },
                        {
                            type: 'link',
                            label: 'Community SDKs',
                            href: '/reference/sdks#community-sdks',
                        },
                    ],
                },
                {
                    label: 'Integrations',
                    type: 'category',
                    link: { type: 'doc', id: 'reference/integrations/index' },
                    items: [
                        'reference/integrations/datadog',
                        {
                            'Jira Server': [
                                'reference/integrations/jira-server-plugin-installation',
                                'reference/integrations/jira-server-plugin-usage',
                            ],
                            'Jira Cloud': [
                                'reference/integrations/jira-cloud-plugin-installation',
                                'reference/integrations/jira-cloud-plugin-usage',
                            ],
                        },
                        'reference/integrations/slack-app',
                        'reference/integrations/slack',
                        'reference/integrations/teams',
                        'reference/integrations/webhook',
                    ],
                },
                {
                    label: 'How-to guides',
                    type: 'category',
                    link: {
                        type: 'generated-index',
                        title: 'How-to guides',
                        description: 'Step-by-step recipes for you to follow.',
                        slug: '/how-to',
                    },
                    items: [
                        {
                            label: 'Unleash API guides',
                            type: 'category',
                            link: {
                                type: 'generated-index',
                                title: 'How-to: Unleash API',
                                description: 'Learn how to work with the Unleash API',
                                slug: '/how-to/api',
                            },
                            items: [
                                'how-to/how-to-create-api-tokens',
                                'how-to/how-to-create-personal-access-tokens',
                                'how-to/how-to-create-project-api-tokens',
                                'how-to/how-to-create-service-accounts',
                                'how-to/how-to-download-login-history',
                                'how-to/how-to-use-the-admin-api',
                                'how-to/how-to-enable-openapi',
                            ],
                        },
                        {
                            label: 'Unleash Proxy guides',
                            type: 'category',
                            link: {
                                type: 'generated-index',
                                title: 'How-to: The Unleash Proxy',
                                description: 'Learn how to work with the Unleash Proxy',
                                slug: '/how-to/proxy',
                            },
                            items: ['how-to/how-to-run-the-unleash-proxy'],
                        },
                        {
                            label: 'Feature flags, strategies, context',
                            type: 'category',
                            link: {
                                type: 'generated-index',
                                title: 'How-to: general Unleash tasks',
                                description:
                                    'Guides for how to perform general Unleash tasks.',
                                slug: '/how-to/misc',
                            },
                            items: [
                                'how-to/how-to-add-strategy-constraints',
                                'how-to/how-to-add-feature-flag-naming-patterns',
                                'how-to/how-to-capture-impression-data',
                                'how-to/how-to-create-feature-toggles',
                                'how-to/how-to-define-custom-context-fields',
                                'how-to/how-to-use-custom-strategies',
                                'how-to/how-to-schedule-feature-releases',
                                'how-to/how-to-synchronize-unleash-instances',
                            ],
                        },
                        {
                            label: 'Environments',
                            type: 'category',
                            link: {
                                type: 'generated-index',
                                title: 'How-to: environments',
                                description: 'Environments how-to guides.',
                                slug: '/how-to/env',
                            },
                            items: [
                                'how-to/how-to-clone-environments',
                                'reference/deploy/import-export',
                                'reference/deploy/environment-import-export',
                            ],
                        },
                        {
                            label: 'Users and permissions',
                            items: [
                                'how-to/how-to-add-users-to-unleash',
                                'how-to/how-to-create-and-assign-custom-root-roles',
                                'how-to/how-to-create-and-assign-custom-project-roles',
                                'how-to/how-to-create-and-manage-user-groups',
                                'how-to/how-to-set-up-group-sso-sync',
                            ],
                            type: 'category',
                            link: {
                                type: 'generated-index',
                                title: 'How-to: users and permissions',
                                description: 'Users and permission how-to guides.',
                                slug: '/how-to/users-and-permissions',
                            },
                        },
                        {
                            label: 'Single Sign-On (SSO)',
                            items: [
                                'how-to/how-to-add-sso-open-id-connect',
                                'how-to/how-to-add-sso-saml',
                                'how-to/how-to-add-sso-saml-keycloak',
                                'how-to/how-to-add-sso-google',
                                'how-to/how-to-add-sso-azure-saml',
                                'how-to/how-to-setup-sso-keycloak-group-sync',
                            ],
                            type: 'category',
                            link: {
                                type: 'generated-index',
                                title: 'How-to: Single Sign-On',
                                description: 'Single Sign-On how-to guides.',
                                slug: '/how-to/sso',
                            },
                        },
                    ]
                },
                {
                    type: 'category',
                    link: {
                        type: 'generated-index',
                        title: 'Self-Hosting Unleash',
                        description:
                            'All you need to learn how to deploy and manage your own Unleash instance.',
                        slug: '/reference/deploy',
                    },
                    label: 'Deploy and manage Unleash',
                    items: [
                        'reference/deploy/getting-started',
                        'reference/deploy/configuring-unleash',
                        'reference/deploy/database-setup',
                        'reference/deploy/database-backup',
                        'reference/deploy/email-service',
                        'reference/deploy/google-auth-hook',
                        'reference/deploy/upgrading-unleash',
                        'reference/deploy/securing-unleash',
                    ],
                },
                {
                    label: 'Troubleshooting',
                    type: 'category',
                    link: {
                        type: 'generated-index',
                        title: 'How-to: troubleshooting',
                        description:
                            'Troubleshooting common problems. If you want to suggest new items, please phrase the title as a concrete problem',
                        slug: '/how-to/troubleshooting',
                    },
                    items: [
                        'how-to/how-to-troubleshoot-flag-exposure',
                        'how-to/how-to-troubleshoot-flag-not-returned',
                        'how-to/how-to-troubleshoot-cors',
                        'how-to/how-to-troubleshoot-feature-not-available',
                    ],
                },
                'generated/unleash-edge',
                'generated/unleash-proxy',
            ],
        },
        {
            label: 'Contributing to Unleash',
            type: 'category',
            collapsed: true,
            link: {
                type: 'generated-index',
                title: 'Contributing to Unleash',
                description: 'Learn how to contribute to unleash.',
                slug: '/developer-guide',
            },
            items: [
                'contributing/developer-guide',
                'contributing/frontend/overview',
                'contributing/backend/overview',
                {
                    type: 'category',
                    label: 'Architectural Decision Records',
                    items: [
                        {
                            type: 'autogenerated',
                            dirName: 'contributing/ADRs', // '.' means the current docs folder
                        },
                    ],
                },
            ],
        },



        {
            label: 'XX Reference documentation',
            collapsed: false,
            type: 'category',
            link: {
                type: 'generated-index',
                title: 'Reference documentation',
                description:
                    'Technical reference documentation relating to Unleash, including APIs, SDKs, Unleash concepts and deployment.',
                slug: '/reference',
            },
            items: [
                {
                    type: 'category',
                    label: 'APIs',
                    items: [
                        {
                            type: 'category',
                            label: 'Legacy API docs',
                            link: {
                                type: 'doc',
                                id: 'reference/api/legacy/unleash/index',
                            },
                            items: [
                                {
                                    'Admin API': [
                                        'reference/api/legacy/unleash/admin/addons',
                                        'reference/api/legacy/unleash/admin/context',
                                        'reference/api/legacy/unleash/admin/events',
                                        'reference/api/legacy/unleash/admin/features-v2',
                                        'reference/api/legacy/unleash/admin/feature-types',
                                        'reference/api/legacy/unleash/admin/features',
                                        'reference/api/legacy/unleash/admin/archive',
                                        'reference/api/legacy/unleash/admin/metrics',
                                        'reference/api/legacy/unleash/admin/projects',
                                        'reference/api/legacy/unleash/admin/segments',
                                        'reference/api/legacy/unleash/admin/state',
                                        'reference/api/legacy/unleash/admin/strategies',
                                        'reference/api/legacy/unleash/admin/tags',
                                        'reference/api/legacy/unleash/admin/user-admin',
                                    ],
                                    'Client API': [
                                        'reference/api/legacy/unleash/client/features',
                                        'reference/api/legacy/unleash/client/metrics',
                                        'reference/api/legacy/unleash/client/register',
                                    ],
                                },
                            ],
                        },
                    ],
                },

            ],
        },

    ],
};