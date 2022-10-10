/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */

module.exports = {
    documentation: [
        'user_guide/index',
        {
            label: 'First steps and tutorials',
            type: 'category',
            collapsed: false,
            link: {
                type: 'generated-index',
                title: 'First steps',
                description: 'Learn how and where to get started with Unleash.',
                slug: '/tutorials',
            },
            items: [
                'user_guide/unleash_overview',
                'user_guide/important-concepts',
                'user_guide/quickstart',
            ],
        },
        {
            label: 'How-to guides',
            collapsed: false,
            type: 'category',
            link: {
                type: 'generated-index',
                title: 'How-to guides',
                description: 'Step-by-step recipes for you to follow.',
                slug: '/how-to',
            },
            items: [
                {
                    type: 'category',
                    link: {
                        type: 'generated-index',
                        title: 'How-to: Unleash API',
                        description: 'Learn how to work with the Unleash API',
                        slug: '/how-to/api',
                    },
                    label: 'Unleash API guides',
                    items: [
                        'user_guide/api-token',
                        'how-to/how-to-create-personal-access-tokens',
                        'advanced/api_access',
                        'how-to/how-to-enable-openapi',
                    ],
                },
                {
                    type: 'category',
                    link: {
                        type: 'generated-index',
                        title: 'How-to: The Unleash Proxy',
                        description: 'Learn how to work with the Unleash Proxy',
                        slug: '/how-to/proxy',
                    },
                    label: 'Unleash Proxy guides',
                    items: ['how-to/how-to-run-the-unleash-proxy'],
                },
                {
                    label: 'Feature toggles, strategies, context',
                    items: [
                        'how-to/how-to-add-strategy-constraints',
                        'how-to/how-to-capture-impression-data',
                        'user_guide/create_feature_toggle',
                        'how-to/how-to-define-custom-context-fields',
                        'how-to/how-to-use-custom-strategies',
                        'how-to/how-to-schedule-feature-releases',
                    ],
                    type: 'category',
                    link: {
                        type: 'generated-index',
                        title: 'How-to: general Unleash tasks',
                        description:
                            'Guides for how to perform general Unleash tasks.',
                        slug: '/how-to/misc',
                    },
                },
                {
                    label: 'Users and permissions',
                    items: [
                        'user_guide/user-management',
                        'how-to/how-to-create-and-assign-custom-project-roles',
                        'how-to/how-to-create-and-manage-user-groups',
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
                        'advanced/sso-open-id-connect',
                        'advanced/sso-saml',
                        'advanced/sso-saml-keycloak',
                        'advanced/sso-google',
                    ],
                    type: 'category',
                    link: {
                        type: 'generated-index',
                        title: 'How-to: Single Sign-On',
                        description: 'Single Sign-On how-to guides.',
                        slug: '/how-to/sso',
                    },
                },
                ,
            ],
        },
        {
            label: 'Reference documentation',
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
                    link: { type: 'doc', id: 'addons/index' },
                    items: [
                        'addons/datadog',
                        'addons/slack',
                        'addons/teams',
                        'addons/webhook',
                    ],
                    label: 'Addons',
                },
                {
                    type: 'category',
                    link: { type: 'doc', id: 'api/index' },
                    label: 'APIs',
                    items: [
                        {
                            'Admin API': [
                                'api/admin/addons',
                                'api/admin/context',
                                'api/admin/events',
                                'api/admin/feature-toggles-v2',
                                'api/admin/feature-types',
                                'api/admin/features',
                                'api/admin/features-archive',
                                'api/admin/metrics',
                                'api/admin/projects',
                                'api/admin/segments',
                                'api/admin/state',
                                'api/admin/strategies',
                                'api/admin/tags',
                                'api/admin/user-admin',
                            ],
                            'Client API': [
                                'api/client/features',
                                'api/client/metrics',
                                'api/client/register',
                            ],
                            'System API': [
                                'api/internal/internal',
                                'api/internal/health',
                            ],
                        },
                        {
                            label: 'OpenAPI docs',
                            collapsed: true,
                            type: 'category',
                            link: {
                                title: 'Unleash Server APIs',
                                type: 'generated-index',
                                description:
                                    'Generated API docs based on the Unleash OpenAPI schema. For the time being, some additional info can also be found in the older API docs.',
                                slug: '/reference/api/unleash',
                            },
                            items: require('./docs/reference/api/unleash/sidebar.js'),
                        },
                    ],
                },
                {
                    type: 'category',
                    label: 'Application SDKs',
                    link: { type: 'doc', id: 'sdks/index' },
                    items: [
                        {
                            type: 'category',
                            label: 'Server-side SDKs',
                            items: [
                                'sdks/go_sdk',
                                'sdks/java_sdk',
                                'sdks/node_sdk',
                                'sdks/php_sdk',
                                'sdks/python_sdk',
                                'sdks/ruby_sdk',
                                {
                                    type: 'link',
                                    href: 'https://github.com/unleash/unleash-client-rust',
                                    label: 'Rust SDK',
                                },
                                'sdks/dot_net_sdk',
                            ],
                        },
                        {
                            type: 'category',
                            label: 'Client-side SDKs',
                            items: [
                                'sdks/android_proxy_sdk',
                                'sdks/proxy-ios',
                                'sdks/proxy-javascript',
                                'sdks/proxy-react',
                                'sdks/proxy-svelte',
                                'sdks/proxy-vue',
                            ],
                        },
                        {
                            type: 'link',
                            label: 'Community SDKs',
                            href: '/sdks#community-sdks',
                        },
                    ],
                },
                {
                    type: 'category',
                    link: {
                        type: 'generated-index',
                        title: 'Deployment and management of Unleash',
                        description:
                            'All you need to learn how to deploy and manage your own Unleash instance.',
                        slug: '/deploy',
                    },
                    label: 'Deploy and manage Unleash',
                    items: [
                        'deploy/getting_started',
                        'deploy/configuring_unleash',
                        'deploy/database-setup',
                        'deploy/database_backup',
                        'deploy/email',
                        'deploy/google_auth',
                        'deploy/import_export',
                        'deploy/migration_guide',
                        'deploy/securing_unleash',
                    ],
                },
                {
                    type: 'category',
                    label: 'Integrations',
                    link: { type: 'doc', id: 'integrations/integrations' },
                    items: [
                        {
                            'Jira Server': [
                                'integrations/jira_server_plugin_installation',
                                'integrations/jira_server_plugin_usage',
                            ],
                        },
                        ,
                    ],
                },
                {
                    type: 'category',
                    link: {
                        type: 'generated-index',
                        title: 'Unleash concepts',
                        description:
                            'Documents describing the inner parts of Unleash.',
                        slug: '/reference/concepts',
                    },
                    label: 'Unleash concepts',
                    items: [
                        'user_guide/activation_strategy',
                        'reference/api-tokens-and-client-keys',
                        'advanced/archived_toggles',
                        'reference/event-log',
                        'advanced/impression-data',
                        'advanced/custom_activation_strategy',
                        'user_guide/environments',
                        'reference/feature-toggles',
                        'advanced/feature_toggle_types',
                        'advanced/toggle_variants',
                        'reference/front-end-api',
                        'reference/playground',
                        'reference/public-signup',
                        'user_guide/projects',
                        'user_guide/rbac',
                        'reference/segments',
                        'advanced/enterprise-authentication',
                        'advanced/stickiness',
                        'advanced/strategy_constraints',
                        'advanced/tags',
                        'user_guide/technical_debt',
                        'user_guide/unleash_context',
                        'sdks/unleash-proxy',
                    ],
                },
            ],
        },
        {
            label: 'Topic guides',
            collapsed: false,
            type: 'category',
            link: {
                type: 'generated-index',
                title: 'Topic guides',
                description:
                    'Discussions, explanations, and explorations regarding topics related to Unleash.',
                slug: '/topics',
            },
            items: ['topics/a-b-testing', 'topics/proxy-hosting'],
        },
    ],
};
