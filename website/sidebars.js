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
            'First steps 👶': [
                'user_guide/unleash_overview',
                'user_guide/important-concepts',
                'user_guide/quickstart',
            ],
        },
        {
            label: 'How-to guides 🪜',
            type: 'category',
            collapsible: true,
            items: [
                'how-to/how-to-add-strategy-constraints',
                'how-to/how-to-define-custom-context-fields',
                'how-to/how-to-use-custom-strategies',

                'advanced/sso-open-id-connect',
                'advanced/sso-saml',
                'advanced/sso-saml-keycloak',
                'advanced/sso-google',
                'advanced/api_access',
                'user_guide/api-token',
                'user_guide/user-management',
                'user_guide/create_feature_toggle',
            ],
        },
        {
            label: 'Reference documentation 📜',
            type: 'category',
            collapsible: false,
            items: [
                {
                    type: 'category',
                    link: { type: 'doc', id: 'addons/index' },
                    items: [
                        'addons/webhook',
                        'addons/slack',
                        'addons/teams',
                        'addons/datadog',
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
                                'api/admin/state',
                                'api/admin/strategies',
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
                        'api/open_api',
                    ],
                },
                {
                    'Unleash SDKs': [
                        'sdks/index',
                        'sdks/unleash-proxy',
                        {
                            type: 'category',
                            collapsible: false,
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
                            collapsible: false,
                            label: 'Client-side SDKs',
                            items: [
                                'sdks/android_proxy_sdk',
                                'sdks/proxy-ios',
                                'sdks/proxy-javascript',
                                'sdks/proxy-react',
                            ],
                        },
                        {
                            type: 'link',
                            label: 'Community SDKs',
                            href: '/sdks#community-sdks',
                        },
                    ],
                    'Unleash concepts': [
                        'user_guide/activation_strategy',
                        'advanced/archived_toggles',
                        'advanced/audit_log',
                        'advanced/custom_activation_strategy',
                        'user_guide/environments',
                        'advanced/feature_toggle_types',
                        'advanced/toggle_variants',
                        'user_guide/projects',
                        'user_guide/rbac',
                        'advanced/enterprise-authentication',
                        'advanced/stickiness',
                        'advanced/strategy_constraints',
                        'advanced/tags',
                        'user_guide/technical_debt',
                        'user_guide/unleash_context',
                    ],
                    'Deploy and manage Unleash': [
                        'deploy/getting_started',
                        'deploy/configuring_unleash',
                        'deploy/securing_unleash',
                        'deploy/email',
                        'deploy/google_auth',
                        'deploy/database-setup',
                        'deploy/database_backup',
                        'deploy/migration_guide',
                        'deploy/import_export',
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
            ],
        },
        {
            'Topic guides 🤓': ['topics/a-b-testing'],
        },
    ],
};
