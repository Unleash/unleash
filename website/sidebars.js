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
            label: 'Reference documentation',
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
                    'Admin API': [
                        'api/admin/features',
                        'api/admin/projects',
                        'api/admin/feature-toggles-v2',
                        'api/admin/features-archive',
                        'api/admin/strategies',
                        'api/admin/metrics',
                        'api/admin/events',
                        'api/admin/state',
                        'api/admin/feature-types',
                        'api/admin/addons',
                        'api/admin/context',
                        'api/admin/user-admin',
                    ],
                    'Client API': [
                        'api/client/features',
                        'api/client/register',
                        'api/client/metrics',
                    ],
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
                        ,
                    ],
                },
            ],
        },
        {
            label: 'How-to guides',
            type: 'category',
            collapsible: true,
            items: [
                'how-to/how-to-add-strategy-constraints',
                'how-to/how-to-define-custom-context-fields',
                'how-to/how-to-use-custom-strategies',
            ],
        },
        {
            Tutorials: [],
            'Getting started': [
                'user_guide/quickstart',
                'user_guide/important-concepts',
                'user_guide/v4-whats-new',
                'user_guide/create_feature_toggle',
                'user_guide/activation_strategy',
                'user_guide/control_rollout',
                'user_guide/projects',
                'user_guide/environments',
                'user_guide/unleash_context',
                'user_guide/user-management',
                'user_guide/rbac',
                'user_guide/api-token',
                'user_guide/technical_debt',
            ],
            Advanced: [
                'advanced/strategy_constraints',
                'advanced/custom_activation_strategy',
                'advanced/feature_toggle_types',
                'advanced/toggle_variants',
                'advanced/stickiness',
                'advanced/archived_toggles',
                'advanced/audit_log',
                'advanced/api_access',
                'advanced/tags',
                'advanced/enterprise-authentication',
                'advanced/sso-open-id-connect',
                'advanced/sso-saml',
                'advanced/sso-saml-keycloak',
                'advanced/sso-google',
            ],
            'Topic guides': ['topics/a-b-testing'],
            'How-to guides': [],
        },
    ],
    api: {
        Introduction: [
            'api/index',
            'api/internal/internal',
            'api/internal/health',
            'api/open_api',
        ],
    },
    'Deploy and manage': {
        'Deploy & configure': [
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
    Integrations: {
        Integrations: ['integrations/integrations'],
        'Jira server': [
            'integrations/jira_server_plugin_installation',
            'integrations/jira_server_plugin_usage',
        ],
    },
};
