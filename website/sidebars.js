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
                    'Client SDKs': [
                        'sdks/index',
                        'sdks/java_sdk',
                        'sdks/node_sdk',
                        'sdks/dot_net_sdk',
                        'sdks/go_sdk',
                        'sdks/python_sdk',
                        'sdks/ruby_sdk',
                        'sdks/php_sdk',
                        'sdks/unleash-proxy',
                        'sdks/android_proxy_sdk',
                        'sdks/proxy-javascript',
                        'sdks/proxy-react',
                        'sdks/proxy-ios',
                        {
                            label: 'Community SDKs',
                            type: 'link',
                            href: '/sdks#community-sdks',
                        },
                    ],
                    'Unleash concepts': [
                        'user_guide/activation_strategy',
                        'user_guide/control_rollout',
                        'user_guide/projects',
                        'user_guide/environments',
                        'user_guide/unleash_context',
                        'user_guide/rbac',
                        'user_guide/technical_debt',
                        'advanced/strategy_constraints',
                        'advanced/custom_activation_strategy',
                        'advanced/feature_toggle_types',
                        'advanced/toggle_variants',
                        'advanced/stickiness',
                        'advanced/archived_toggles',
                        'advanced/audit_log',
                        'advanced/tags',
                        'advanced/enterprise-authentication',
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
