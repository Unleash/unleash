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
        {
            label: 'Get started',
            type: 'category',
            link: {
                type: 'doc',
                id: 'quickstart',
            },
            items: [
                {
                    type: 'doc',
                    label: 'Quickstart',
                    id: 'quickstart',
                },
                {
                    type: 'doc',
                    label: 'Introduction to feature flags',
                    id: 'get-started/what-is-a-feature-flag',
                },
                {
                    type: 'doc',
                    label: 'Unleash architecture overview',
                    id: 'get-started/unleash-overview',
                },
            ],
        },
        {
            label: 'Core concepts',
            type: 'category',
            link: {
                type: 'doc',
                id: 'reference/core-concepts',
            },
            items: [
                {
                    label: 'Projects and environments',
                    collapsed: true,
                    type: 'category',
                    link: { type: 'doc', id: 'reference/projects' },
                    items: [
                        'reference/projects',
                        'reference/project-collaboration-mode',
                        'reference/environments',
                    ],
                },
                {
                    label: 'Feature flags and activation strategies',
                    collapsed: true,
                    type: 'category',
                    link: {
                        type: 'doc',
                        id: 'reference/feature-toggles',
                    },
                    items: [
                        'reference/feature-toggles',
                        'reference/activation-strategies',
                        'reference/strategy-variants',
                        'understanding-unleash/managing-constraints',
                        'reference/segments',
                        'reference/unleash-context',
                        'reference/stickiness',
                        'reference/release-templates',
                    ],
                },
                {
                    label: 'Identity and access',
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
                    label: 'Instance health and configuration',
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
                    label: 'Testing and monitoring',
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
                    label: 'Automation and integrations',
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
                {
                    type: 'doc',
                    label: 'Import and export',
                    id: 'reference/import-export',
                },
            ],
        },
        {
            label: 'Tutorials and guides',
            type: 'category',
            link: {
                type: 'doc',
                id: 'guides-overview',
            },
            items: [
                {
                    label: 'Feature management best practices',
                    collapsed: true,
                    type: 'category',
                    link: {
                        type: 'doc',
                        id: 'guides/feature-flag-best-practices',
                    },
                    items: [
                        {
                            type: 'doc',
                            label: 'Building and scaling feature flag systems',
                            id: 'guides/feature-flag-best-practices',
                        },
                        {
                            type: 'doc',
                            label: 'Using feature flags at scale',
                            id: 'guides/best-practices-using-feature-flags-at-scale',
                        },
                        {
                            type: 'doc',
                            label: 'Migrating from homegrown feature management solutions',
                            id: 'guides/feature-flag-migration-best-practices',
                        },
                    ],
                },
                {
                    label: 'Development and release workflows',
                    type: 'category',
                    collapsed: true,
                    link: {
                        type: 'doc',
                        id: 'feature-flag-tutorials/use-cases/how-to-create-feature-toggles',
                    },
                    items: [
                        {
                            type: 'doc',
                            id: 'feature-flag-tutorials/use-cases/how-to-create-feature-toggles',
                        },
                        {
                            type: 'doc',
                            label: 'Schedule a feature release',
                            id: 'guides/how-to-schedule-feature-releases',
                        },
                        {
                            type: 'doc',
                            label: 'Trunk-based development',
                            id: 'feature-flag-tutorials/use-cases/trunk-based-development',
                        },
                        {
                            type: 'doc',
                            label: 'Gradual rollout',
                            id: 'feature-flag-tutorials/use-cases/gradual-rollout',
                        },
                        {
                            type: 'doc',
                            label: 'Unleash Edge quickstart',
                            id: 'guides/unleash-edge-quickstart',
                        },
                    ],
                },
                {
                    label: 'Enterprise-grade security and scale',
                    type: 'category',
                    collapsed: true,
                    link: {
                        type: 'doc',
                        id: 'feature-flag-tutorials/use-cases/user-management-access-controls',
                    },
                    items: [
                        {
                            type: 'doc',
                            label: 'User management, access controls, and auditing',
                            id: 'feature-flag-tutorials/use-cases/user-management-access-controls',
                        },
                        {
                            type: 'doc',
                            label: 'Security and compliance',
                            id: 'feature-flag-tutorials/use-cases/security-compliance',
                        },
                        {
                            type: 'doc',
                            label: 'Scaling Unleash',
                            id: 'feature-flag-tutorials/use-cases/scaling-unleash',
                        },
                        {
                            type: 'doc',
                            label: 'Managing feature flags in code',
                            id: 'feature-flag-tutorials/use-cases/manage-feature-flags-in-code',
                        },
                        {
                            type: 'doc',
                            label: 'Organizing feature flags using projects and environments',
                            id: 'feature-flag-tutorials/use-cases/organize-feature-flags',
                        },
                    ],
                },
                {
                    label: 'Experimentation and analytics',
                    type: 'category',
                    collapsed: true,
                    link: {
                        type: 'doc',
                        id: 'feature-flag-tutorials/use-cases/a-b-testing',
                    },
                    items: [
                        {
                            type: 'doc',
                            label: 'A/B testing',
                            id: 'feature-flag-tutorials/use-cases/a-b-testing',
                        },
                        {
                            type: 'doc',
                            label: 'Feature flags for AI',
                            id: 'feature-flag-tutorials/use-cases/ai',
                        },
                        {
                            type: 'doc',
                            label: 'Use impression data for analytics',
                            id: 'feature-flag-tutorials/use-cases/how-to-capture-impression-data',
                        },
                    ],
                },
                {
                    type: 'category',
                    label: 'Language and framework examples',
                    collapsed: true,
                    link: {
                        type: 'doc',
                        id: 'feature-flag-tutorials/react/implementing-feature-flags',
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
                            type: 'doc',
                            label: 'Next.js',
                            id: 'feature-flag-tutorials/nextjs/implementing-feature-flags-nextjs',
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
                            type: 'doc',
                            label: 'JavaScript',
                            id: 'feature-flag-tutorials/javascript/implementing-feature-flags-js',
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
                            type: 'doc',
                            label: 'Serverless',
                            id: 'feature-flag-tutorials/serverless/implementing-feature-flags-in-aws-lambda',
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
                            label: 'Flutter',
                            id: 'feature-flag-tutorials/flutter/a-b-testing',
                        },
                        {
                            type: 'doc',
                            label: 'SvelteKit',
                            id: 'feature-flag-tutorials/sveltekit/implementing-feature-flags-sveltekit',
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
                    ],
                },
            ],
        },
        {
            label: 'SDKs',
            type: 'category',
            link: { type: 'doc', id: 'reference/sdks/index' },
            items: [
                {
                    type: 'category',
                    label: 'Backend SDKs',
                    items: [
                        {
                            type: 'autogenerated',
                            dirName: 'generated/sdks/backend',
                        },
                    ],
                },
                {
                    type: 'category',
                    label: 'Frontend SDKs',
                    items: [
                        {
                            type: 'autogenerated',
                            dirName: 'generated/sdks/frontend',
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
            label: 'API reference',
            type: 'category',
            link: {
                type: 'doc',
                id: 'api-overview',
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
        {
            label: 'Integrate and deploy',
            type: 'category',
            items: [
                {
                    type: 'doc',
                    label: 'Unleash hosting options',
                    id: 'deploy/hosting-options',
                },
                {
                    type: 'category',
                    link: {
                        type: 'doc',
                        id: 'deploy/getting-started',
                    },
                    label: 'Self-hosting Unleash',
                    items: [
                        'deploy/getting-started',
                        'deploy/configuring-unleash',
                        'deploy/upgrading-unleash',
                        'deploy/license-keys',
                        'deploy/https',
                        {
                            type: 'doc',
                            label: 'Synchronize Unleash instances',
                            id: 'guides/how-to-synchronize-unleash-instances',
                        },
                    ],
                },
                {
                    label: 'Single sign-on',
                    type: 'category',
                    link: {
                        type: 'doc',
                        id: 'single-sign-on/how-to-add-sso-open-id-connect',
                    },
                    items: [
                        'single-sign-on/how-to-add-sso-open-id-connect',
                        'single-sign-on/how-to-add-sso-saml',
                        'single-sign-on/how-to-add-sso-saml-keycloak',
                        'single-sign-on/how-to-add-sso-azure-saml',
                        'single-sign-on/how-to-setup-sso-keycloak-group-sync',
                        'single-sign-on/how-to-set-up-group-sso-sync',
                    ],
                },
                {
                    label: 'Automatic provisioning',
                    type: 'category',
                    link: {
                        type: 'doc',
                        id: 'provisioning/how-to-setup-provisioning-with-okta',
                    },
                    items: [
                        'provisioning/how-to-setup-provisioning-with-okta',
                        'provisioning/how-to-setup-provisioning-with-entra',
                    ],
                },
                {
                    label: 'Integrations',
                    type: 'category',
                    link: {
                        type: 'doc',
                        id: 'reference/integrations/index',
                    },
                    items: [
                        'reference/integrations/datadog',
                        {
                            type: 'category',
                            label: 'Jira server',
                            items: [
                                'reference/integrations/jira-server-plugin-installation',
                                'reference/integrations/jira-server-plugin-usage',
                            ],
                        },
                        {
                            type: 'category',
                            label: 'Jira cloud',
                            items: [
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
                        {
                            type: 'doc',
                            label: 'MCP',
                            id: 'generated/mcp',
                        },
                    ],
                },
            ],
        },
        {
            label: 'Data privacy and compliance',
            type: 'category',
            link: {
                type: 'doc',
                id: 'understanding-unleash/data-collection',
            },
            items: [
                {
                    type: 'doc',
                    label: 'Data collection and privacy',
                    id: 'understanding-unleash/data-collection',
                },
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
                            label: 'SOC2 type II',
                            id: 'using-unleash/compliance/soc2',
                        },
                        {
                            type: 'doc',
                            label: 'ISO27001',
                            id: 'using-unleash/compliance/iso27001',
                        },
                    ],
                },
            ],
        },
        {
            label: 'Support and community',
            type: 'category',
            items: [
                {
                    type: 'doc',
                    id: 'troubleshooting',
                    label: 'Troubleshooting',
                },
                {
                    type: 'doc',
                    id: 'availability',
                    label: 'Feature availability and versioning',
                },
                {
                    type: 'doc',
                    id: 'oss-comparison',
                    label: 'Compare Unleash OSS and Unleash Enterprise',
                },
                {
                    label: 'Contribute to Unleash',
                    type: 'category',
                    collapsed: true,
                    link: {
                        type: 'doc',
                        id: 'contributing/developer-guide',
                    },
                    items: [
                        'contributing/developer-guide',
                        'contributing/frontend/overview',
                        'contributing/backend/overview',
                        {
                            type: 'category',
                            label: 'Architectural decision records',
                            items: [
                                {
                                    type: 'autogenerated',
                                    dirName: 'contributing/ADRs',
                                },
                            ],
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
