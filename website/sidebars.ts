/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */

import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

import docsSidebar from './docs/reference/api/unleash/sidebar.ts';

const sidebars: SidebarsConfig = {
    academy: [
        {
            label: 'Unleash Academy',
            collapsed: true,
            type: 'category',
            link: {
                type: 'doc',
                id: 'unleash-academy/introduction',
            },
            items: [
                'unleash-academy/foundational',
                'unleash-academy/advanced-for-devs',
                'unleash-academy/managing-unleash-for-devops',
            ],
        },
        {
            type: 'ref',
            id: 'welcome',
            label: 'Docs',
            className: 'show-when-collapsed',
        },
    ],
    documentation: [
        'quickstart',
        {
            label: 'Feature Flags Developer Guide',
            type: 'category',
            link: {
                type: 'generated-index',
                title: 'Feature Flag Developer Guide',
                description:
                    'What are feature flags? And other concepts to get you started.',
                slug: '/topics',
            },
            items: [
                {
                    label: 'Feature Flag Concepts',
                    collapsed: true,
                    type: 'category',
                    items: ['topics/concepts/what-is-a-feature-flag'],
                },
                {
                    label: 'Feature Flag Best Practices',
                    collapsed: true,
                    type: 'category',
                    link: {
                        type: 'generated-index',
                        title: 'Feature Flag Best Practices',
                        description:
                            'Principles and recommendations for best practices of using feature flags.',
                        slug: 'topics/feature-flags/',
                    },
                    items: [
                        {
                            type: 'doc',
                            label: 'Building and scaling feature flag systems',
                            id: 'topics/feature-flags/feature-flag-best-practices',
                        },
                        {
                            type: 'doc',
                            label: 'Using feature flags at scale',
                            id: 'topics/feature-flags/best-practices-using-feature-flags-at-scale',
                        },
                        {
                            type: 'doc',
                            label: 'Migrating from homegrown feature management solutions',
                            id: 'topics/feature-flag-migration/feature-flag-migration-best-practices',
                        },
                    ],
                },
                {
                    label: 'Feature Flag Tutorials',
                    type: 'category',
                    collapsed: true,
                    link: {
                        type: 'generated-index',
                        title: 'Feature Flag Tutorials',
                        description:
                            'Tutorials to implement feature flags with your framework.',
                        slug: 'feature-flag-tutorials',
                    },
                    items: [
                        {
                            type: 'category',
                            label: 'Use Cases',
                            collapsed: true,
                            link: {
                                type: 'generated-index',
                                title: 'Use Cases',
                                slug: 'use-cases',
                            },
                            items: [
                                {
                                    type: 'doc',
                                    label: 'Gradual Rollout',
                                    id: 'feature-flag-tutorials/use-cases/gradual-rollout',
                                },
                                {
                                    type: 'doc',
                                    label: 'A/B Testing',
                                    id: 'feature-flag-tutorials/use-cases/a-b-testing',
                                },
                                {
                                    type: 'doc',
                                    label: 'Feature Flags for AI',
                                    id: 'feature-flag-tutorials/use-cases/ai',
                                },
                                {
                                    type: 'doc',
                                    label: 'Trunk-Based Development',
                                    id: 'feature-flag-tutorials/use-cases/trunk-based-development',
                                },
                                {
                                    type: 'doc',
                                    label: 'User Management, Access Controls, and Auditing',
                                    id: 'feature-flag-tutorials/use-cases/user-management-access-controls',
                                },
                                {
                                    type: 'doc',
                                    label: 'Security and Compliance',
                                    id: 'feature-flag-tutorials/use-cases/security-compliance',
                                },
                                {
                                    type: 'doc',
                                    label: 'Scaling Unleash',
                                    id: 'feature-flag-tutorials/use-cases/scaling-unleash',
                                },
                            ],
                        },
                        {
                            type: 'category',
                            label: 'Languages and Frameworks',
                            collapsed: true,
                            link: {
                                type: 'generated-index',
                                title: 'Languages and Frameworks',
                                slug: 'languages-and-frameworks',
                            },
                            items: [
                                {
                                    type: 'category',
                                    label: 'React',
                                    link: {
                                        type: 'doc',
                                        id: 'feature-flag-tutorials/react/implementing-feature-flags',
                                    },
                                    items: [
                                        {
                                            type: 'doc',
                                            label: 'Examples',
                                            id: 'feature-flag-tutorials/react/examples',
                                        },
                                    ],
                                },
                                {
                                    type: 'category',
                                    label: 'Python',
                                    link: {
                                        type: 'doc',
                                        id: 'feature-flag-tutorials/python/implementing-feature-flags',
                                    },
                                    items: [
                                        {
                                            type: 'doc',
                                            label: 'Python Examples',
                                            id: 'feature-flag-tutorials/python/examples',
                                        },
                                        {
                                            type: 'doc',
                                            label: 'Django Tutorial',
                                            id: 'feature-flag-tutorials/django/implementing-feature-flags-django',
                                        },
                                        {
                                            type: 'doc',
                                            label: 'Django Examples',
                                            id: 'feature-flag-tutorials/django/django-examples',
                                        },
                                    ],
                                },
                                {
                                    type: 'category',
                                    label: 'Java',
                                    link: {
                                        type: 'doc',
                                        id: 'feature-flag-tutorials/java/implementing-feature-flags',
                                    },
                                    items: [
                                        {
                                            type: 'doc',
                                            label: 'Spring Boot',
                                            id: 'feature-flag-tutorials/java/spring-boot-implementing-feature-flags',
                                        },
                                        {
                                            type: 'doc',
                                            label: 'Spring Boot Examples',
                                            id: 'feature-flag-tutorials/java/spring-boot-examples',
                                        },
                                    ],
                                },
                                {
                                    type: 'category',
                                    label: 'Ruby',
                                    link: {
                                        type: 'doc',
                                        id: 'feature-flag-tutorials/ruby/implementing-feature-flags-ruby',
                                    },
                                    items: [
                                        {
                                            type: 'doc',
                                            label: 'Ruby Examples',
                                            id: 'feature-flag-tutorials/ruby/ruby-examples',
                                        },
                                        {
                                            type: 'doc',
                                            label: 'Rails Tutorial',
                                            id: 'feature-flag-tutorials/rails/implementing-feature-flags-rails',
                                        },
                                        {
                                            type: 'doc',
                                            label: 'Rails Examples',
                                            id: 'feature-flag-tutorials/rails/rails-examples',
                                        },
                                    ],
                                },
                                {
                                    type: 'category',
                                    label: 'Go',
                                    link: {
                                        type: 'doc',
                                        id: 'feature-flag-tutorials/golang/implementing-feature-flags-golang',
                                    },
                                    items: [
                                        {
                                            type: 'doc',
                                            label: 'Go Examples',
                                            id: 'feature-flag-tutorials/golang/golang-examples',
                                        },
                                    ],
                                },
                                {
                                    type: 'category',
                                    label: '.NET',
                                    link: {
                                        type: 'doc',
                                        id: 'feature-flag-tutorials/dotnet/implementing-feature-flags-dotnet',
                                    },
                                    items: [
                                        {
                                            type: 'doc',
                                            label: 'Examples',
                                            id: 'feature-flag-tutorials/dotnet/dotnet-examples',
                                        },
                                    ],
                                },
                                {
                                    type: 'category',
                                    label: 'iOS',
                                    link: {
                                        type: 'doc',
                                        id: 'feature-flag-tutorials/ios/implementing-feature-flags-ios',
                                    },
                                    items: [
                                        {
                                            type: 'doc',
                                            label: 'Examples',
                                            id: 'feature-flag-tutorials/ios/examples',
                                        },
                                    ],
                                },
                                {
                                    type: 'category',
                                    label: 'Rust',
                                    link: {
                                        type: 'doc',
                                        id: 'feature-flag-tutorials/rust/implementing-feature-flags-rust',
                                    },
                                    items: [
                                        {
                                            type: 'doc',
                                            label: 'Examples',
                                            id: 'feature-flag-tutorials/rust/rust-examples',
                                        },
                                    ],
                                },
                                {
                                    type: 'doc',
                                    label: 'JavaScript',
                                    id: 'feature-flag-tutorials/javascript/implementing-feature-flags-js',
                                },
                                {
                                    type: 'doc',
                                    label: 'Serverless',
                                    id: 'feature-flag-tutorials/serverless/implementing-feature-flags-in-aws-lambda',
                                },
                                {
                                    type: 'doc',
                                    label: 'Flutter',
                                    id: 'feature-flag-tutorials/flutter/a-b-testing',
                                },
                                {
                                    type: 'doc',
                                    label: 'Next.js',
                                    id: 'feature-flag-tutorials/nextjs/implementing-feature-flags-nextjs',
                                },
                                {
                                    type: 'doc',
                                    label: 'SvelteKit',
                                    id: 'feature-flag-tutorials/sveltekit/implementing-feature-flags-sveltekit',
                                },
                            ],
                        },
                    ],
                },
            ],
        },

        {
            label: 'Understanding Unleash',
            collapsed: false,
            type: 'category',
            link: {
                type: 'generated-index',
                title: 'Understanding Unleash',
                description:
                    'Documentation on how Unleash works, high-level architecture and important concepts.',
                slug: 'understanding-unleash',
            },
            items: [
                'understanding-unleash/unleash-overview',
                'understanding-unleash/the-anatomy-of-unleash',
                'understanding-unleash/managing-constraints',
                'understanding-unleash/hosting-options',
                'understanding-unleash/data-collection',
                {
                    type: 'category',
                    link: {
                        type: 'generated-index',
                        title: 'Unleash Concepts',
                        description:
                            'Documents describing the inner parts of Unleash.',
                        slug: '/reference',
                    },
                    label: 'Unleash Concepts',
                    items: [
                        {
                            label: 'Projects and Environments',
                            collapsed: false,
                            type: 'category',
                            link: { type: 'doc', id: 'reference/projects' },
                            items: [
                                'reference/projects',
                                'reference/project-collaboration-mode',
                                'reference/environments',
                            ],
                        },
                        {
                            label: 'Feature Flags and Activation Strategies',
                            collapsed: false,
                            type: 'category',
                            link: {
                                type: 'doc',
                                id: 'reference/feature-toggles',
                            },
                            items: [
                                'reference/feature-toggles',
                                'reference/activation-strategies',
                                'reference/strategy-variants',
                                'reference/segments',
                                'reference/unleash-context',
                                'reference/stickiness',
                                'reference/release-templates',
                            ],
                        },
                        {
                            label: 'Access Controls',
                            collapsed: true,
                            type: 'category',
                            link: {
                                type: 'doc',
                                id: 'reference/api-tokens-and-client-keys',
                            },
                            items: [
                                'reference/api-tokens-and-client-keys',
                                'reference/front-end-api',
                                'reference/rbac',
                                'reference/sso',
                                'reference/scim',
                                'reference/change-requests',
                                'reference/public-signup',
                            ],
                        },
                        {
                            label: 'Instance Health and Configuration',
                            collapsed: true,
                            type: 'category',
                            link: {
                                type: 'doc',
                                id: 'reference/technical-debt',
                            },
                            items: [
                                'reference/technical-debt',
                                'reference/insights',
                                'reference/resource-limits',
                            ],
                        },
                        {
                            label: 'Testing and Monitoring',
                            collapsed: true,
                            type: 'category',
                            link: {
                                type: 'doc',
                                id: 'reference/impression-data',
                            },
                            items: [
                                'reference/impression-data',
                                'reference/events',
                                'reference/playground',
                                'reference/network-view',
                            ],
                        },
                        {
                            label: 'Automation and Integrations',
                            collapsed: true,
                            type: 'category',
                            link: {
                                type: 'doc',
                                id: 'reference/applications',
                            },
                            items: [
                                'reference/applications',
                                'reference/service-accounts',
                                'reference/signals',
                                'reference/actions',
                            ],
                        },
                        {
                            label: 'Admin UI',
                            collapsed: true,
                            type: 'category',
                            link: {
                                type: 'doc',
                                id: 'reference/login-history',
                            },
                            items: [
                                'reference/login-history',
                                'reference/banners',
                                'reference/command-menu',
                                'reference/search-operators',
                                'reference/maintenance-mode',
                            ],
                        },
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
                description:
                    'Documentation on how to accomplish specific tasks when building with Unleash, including API and SDK documentation.',
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
                        docsSidebar,
                        {
                            'System API': [
                                'reference/api/legacy/unleash/internal/prometheus',
                                'reference/api/legacy/unleash/internal/health',
                            ],
                            '(Legacy Docs) Admin API': [
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
                            '(Legacy Docs) Client API': [
                                'reference/api/legacy/unleash/client/features',
                                'reference/api/legacy/unleash/client/metrics',
                                'reference/api/legacy/unleash/client/register',
                            ],
                        },
                    ],
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
                    label: 'Integrations and automation',
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
                        'reference/integrations/teams',
                        'reference/integrations/webhook',
                        {
                            type: 'doc',
                            label: 'Terraform',
                            id: 'reference/terraform',
                        },
                    ],
                },
                {
                    type: 'category',
                    link: {
                        type: 'doc',
                        id: 'using-unleash/deploy/getting-started',
                    },
                    label: 'Self-hosting Unleash',
                    items: [
                        'using-unleash/deploy/getting-started',
                        'using-unleash/deploy/configuring-unleash',
                        'using-unleash/deploy/upgrading-unleash',
                        'using-unleash/deploy/license-keys',
                    ],
                },
                {
                    label: 'Single sign-on',
                    items: [
                        'how-to/how-to-add-sso-open-id-connect',
                        'how-to/how-to-add-sso-saml',
                        'how-to/how-to-add-sso-saml-keycloak',
                        'how-to/how-to-add-sso-azure-saml',
                        'how-to/how-to-setup-sso-keycloak-group-sync',
                    ],
                    type: 'category',
                    link: {
                        type: 'generated-index',
                        title: 'How-to: Single sign-on',
                        description: 'Single sign-on guides.',
                        slug: '/how-to/sso',
                    },
                },
                {
                    label: 'Automatic provisioning',
                    items: [
                        'how-to/how-to-setup-provisioning-with-okta',
                        'how-to/how-to-setup-provisioning-with-entra',
                    ],
                    type: 'category',
                    link: {
                        type: 'generated-index',
                        title: 'How to: Provisioning',
                        description: 'Provisioning how-to guides.',
                        slug: '/how-to/provisioning',
                    },
                },
                {
                    type: 'category',
                    label: 'Unleash Edge',
                    collapsed: true,
                    link: {
                        type: 'doc',
                        id: 'generated/unleash-edge',
                    },
                    items: [
                        'generated/unleash-edge/concepts',
                        'generated/unleash-edge/deploying',
                        'generated/unleash-edge/benchmarking',
                        'generated/unleash-edge/cli',
                        'generated/unleash-edge/development-guide',
                        'generated/unleash-edge/migration-guide',
                    ],
                },
                'generated/unleash-proxy',
                {
                    type: 'category',
                    label: 'Compliance',
                    link: {
                        type: 'doc',
                        id: 'using-unleash/compliance/compliance-overview',
                    },
                    items: [
                        {
                            type: 'doc',
                            label: 'FedRAMP',
                            id: 'using-unleash/compliance/fedramp',
                        },
                        {
                            type: 'doc',
                            label: 'SOC2 Type II',
                            id: 'using-unleash/compliance/soc2',
                        },
                        {
                            type: 'doc',
                            label: 'ISO27001',
                            id: 'using-unleash/compliance/iso27001',
                        },
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
                        slug: '/using-unleash/troubleshooting',
                    },
                    items: [
                        'using-unleash/troubleshooting/cors',
                        'using-unleash/troubleshooting/https',
                        'using-unleash/troubleshooting/feature-not-available',
                        'using-unleash/troubleshooting/flag-exposure',
                        'using-unleash/troubleshooting/flag-not-returned',
                        'using-unleash/troubleshooting/flag-abn-test-unexpected-result',
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
                                description:
                                    'Learn how to work with the Unleash API',
                                slug: '/how-to/api',
                            },
                            items: [
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
                                description:
                                    'Learn how to work with the Unleash Proxy',
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
                                'how-to/how-to-capture-impression-data',
                                'how-to/how-to-create-feature-toggles',
                                'how-to/how-to-create-and-display-banners',
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
                            items: ['how-to/how-to-environment-import-export'],
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
                                description:
                                    'Users and permission how-to guides.',
                                slug: '/how-to/users-and-permissions',
                            },
                        },
                    ],
                },
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
                slug: '/contributing',
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
            type: 'ref',
            id: 'unleash-academy/introduction',
            label: 'Unleash Academy',
            className: 'show-when-collapsed',
        },
    ],
};

export default sidebars;
