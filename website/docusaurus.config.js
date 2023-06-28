const { sdks } = require('./remote-content/sdks');
const { docs: edgeAndProxy } = require('./remote-content/edge-proxy');

// for a given redirect object, modify it's `from` property such that for every
// path that doesn't start with `/docs/`, a corresponding path that _does_ start
// with `/docs/` is added.
//
// For instance, given the object
//
// {
//   to: '/new/path',
//   from: ['/old/path', '/docs/other/old/path'],
// }
//
// it will produce
//
// {
//   to: '/new/path',
//   from: ['/old/path', '/docs/old/path', '/docs/other/old/path'],
// }
//
const addDocsRoutePrefix = ({ from, ...rest }) => {
    const addDocs = (from) => {
        if (Array.isArray(from)) {
            // if `from` is a list, then check each entry
            return from.flatMap(addDocs);
        } else {
            if (from.startsWith('/docs/')) {
                return [from];
            } else {
                return [from, `/docs${from}`];
            }
        }
    };

    return {
        ...rest,
        from: addDocs(from),
    };
};
/** @type {import('@docusaurus/types').DocusaurusConfig} */
module.exports = {
    title: 'Unleash',
    tagline: 'The enterprise ready feature toggle service',
    url: 'https://docs.getunleash.io',
    baseUrl: '/',
    onBrokenLinks: 'throw',
    onBrokenMarkdownLinks: 'throw',
    favicon: 'img/favicon.ico',
    organizationName: 'Unleash', // Usually your GitHub org/user name.
    projectName: 'unleash.github.io', // Usually your repo name.
    trailingSlash: false,
    markdown: { mermaid: true },
    customFields: {
        // expose env vars etc here
        environment: process.env.NODE_ENV,
    },
    themeConfig: {
        defaultMode: 'light',
        disableSwitch: true,
        respectPrefersColorScheme: false,
        algolia: {
            appId: '5U05JI5NE1',
            apiKey: 'dc9c4491fcf9143ee34015f22d1dd9d6',
            indexName: 'getunleash',
        },
        navbar: {
            title: 'Unleash',
            logo: {
                alt: 'Unleash logo',
                src: 'img/logo.svg',
            },
            items: [
                {
                    href: 'https://www.getunleash.io/plans',
                    label: 'Unleash Enterprise',
                    position: 'right',
                },
                {
                    href: 'https://github.com/Unleash/unleash',
                    position: 'right',
                    className: 'header-github-link',
                    'aria-label': 'Unleash GitHub repository',
                },
            ],
        },
        prism: {
            theme: require('prism-react-renderer/themes/oceanicNext'),
            additionalLanguages: [
                'csharp',
                'dart',
                'http',
                'java',
                'kotlin',
                'php',
                'ruby',
                'rust',
                'swift',
            ],
        },
        footer: {
            style: 'dark',
            links: [
                {
                    title: 'Product',
                    items: [
                        {
                            label: 'Docs',
                            to: '/',
                        },
                        {
                            label: 'Unleash on GitHub',
                            href: 'https://github.com/Unleash/unleash',
                        },
                        {
                            label: 'Roadmap',
                            href: 'https://github.com/orgs/Unleash/projects/10',
                        },
                        {
                            label: 'Unleash help center',
                            href: 'https://getunleash.zendesk.com/hc/en-gb',
                        },
                    ],
                },
                {
                    title: 'Community',
                    items: [
                        {
                            label: 'GitHub discussions',
                            href: 'https://github.com/unleash/unleash/discussions/',
                        },
                        {
                            label: 'Slack',
                            href: 'https://slack.unleash.run/',
                        },
                        {
                            label: 'Stack Overflow',
                            href: 'https://stackoverflow.com/questions/tagged/unleash',
                        },
                        {
                            label: 'Twitter',
                            href: 'https://twitter.com/getunleash',
                        },
                    ],
                },
            ],
            copyright: `Copyright © ${new Date().getFullYear()} Unleash. Built with Docusaurus.`,
            logo: {
                src: 'img/logo.svg',
                alt: 'Unleash logo',
            },
        },
        image: 'img/logo.png',
    },
    presets: [
        [
            '@docusaurus/preset-classic',
            {
                docs: {
                    sidebarPath: require.resolve('./sidebars.js'),
                    // Please change this to your repo.
                    editUrl:
                        'https://github.com/Unleash/unleash/edit/main/website/',
                    routeBasePath: '/',
                    remarkPlugins: [
                        [
                            require('@docusaurus/remark-plugin-npm2yarn'),
                            { sync: true },
                        ],
                    ],
                    docLayoutComponent: '@theme/DocPage',
                    docItemComponent: '@theme/ApiItem',
                },
                theme: {
                    customCss: require.resolve('./src/css/custom.css'),
                },
                googleAnalytics: {
                    trackingID: 'UA-134882379-1',
                },
                googleTagManager: {
                    containerId: 'GTM-KV5PRR2',
                },
            },
        ],
    ],
    plugins: [
        [
            // heads up to anyone making redirects:
            //
            // remember that redirects only work in production and not in
            // development, as mentioned in the docs
            // https://docusaurus.io/docs/api/plugins/@docusaurus/plugin-client-redirects/
            '@docusaurus/plugin-client-redirects',
            {
                fromExtensions: ['html', 'htm'],
                redirects: [
                    {
                        to: '/how-to/how-to-create-api-tokens',
                        from: [
                            '/user_guide/api-token',
                            '/deploy/user_guide/api-token',
                        ],
                    },
                    {
                        from: '/advanced/audit_log',
                        to: '/reference/event-log',
                    },
                    {
                        from: '/api/open_api',
                        to: '/reference/api/unleash',
                    },
                    {
                        from: '/advanced/api_access',
                        to: '/how-to/how-to-use-the-admin-api',
                    },
                    {
                        from: '/advanced/archived_toggles',
                        to: '/reference/archived-toggles',
                    },
                    {
                        from: [
                            '/advanced/custom-activation-strategy',
                            '/advanced/custom_activation_strategy',
                        ],
                        to: '/reference/custom-activation-strategies',
                    },
                    {
                        from: '/advanced/feature_toggle_types',
                        to: '/reference/feature-toggle-types',
                    },
                    {
                        from: [
                            '/toggle_variants',
                            '/advanced/feature_toggle_variants',
                            '/advanced/toggle_variants',
                        ],
                        to: '/reference/feature-toggle-variants',
                    },
                    {
                        from: [
                            '/advanced/impression-data',
                            '/advanced/impression_data',
                        ],
                        to: '/reference/impression-data',
                    },
                    {
                        from: '/advanced/stickiness',
                        to: '/reference/stickiness',
                    },
                    {
                        from: '/advanced/sso-google',
                        to: '/how-to/how-to-add-sso-google',
                    },
                    {
                        from: '/advanced/sso-open-id-connect',
                        to: '/how-to/how-to-add-sso-open-id-connect',
                    },
                    {
                        from: '/advanced/sso-saml-keycloak',
                        to: '/how-to/how-to-add-sso-saml-keycloak',
                    },
                    {
                        from: '/advanced/sso-saml',
                        to: '/how-to/how-to-add-sso-saml',
                    },
                    {
                        from: '/advanced/strategy_constraints',
                        to: '/reference/strategy-constraints',
                    },
                    {
                        from: '/advanced/tags',
                        to: '/reference/tags',
                    },
                    {
                        from: '/advanced/enterprise-authentication',
                        to: '/reference/sso',
                    },
                    {
                        from: '/deploy',
                        to: '/reference/deploy',
                    },
                    {
                        from: '/deploy/getting_started',
                        to: '/reference/deploy/getting-started',
                    },
                    {
                        from: '/deploy/configuring_unleash',
                        to: '/reference/deploy/configuring-unleash',
                    },
                    {
                        from: '/deploy/configuring_unleash_v3',
                        to: '/reference/deploy/configuring-unleash-v3',
                    },
                    {
                        from: '/deploy/database-setup',
                        to: '/reference/deploy/database-setup',
                    },
                    {
                        from: '/deploy/database_backup',
                        to: '/reference/deploy/database-backup',
                    },
                    {
                        from: '/deploy/email',
                        to: '/reference/deploy/email-service',
                    },
                    {
                        from: '/deploy/google_auth_v3',
                        to: '/reference/deploy/google-auth-v3',
                    },
                    {
                        from: '/deploy/google_auth',
                        to: '/reference/deploy/google-auth-hook',
                    },
                    {
                        from: '/deploy/import_export',
                        to: '/reference/deploy/import-export',
                    },
                    {
                        from: '/deploy/migration_guide',
                        to: '/reference/deploy/migration-guide',
                    },
                    {
                        from: '/deploy/securing_unleash',
                        to: '/reference/deploy/securing-unleash',
                    },
                    {
                        from: '/deploy/securing-unleash-v3',
                        to: '/reference/deploy/securing-unleash-v3',
                    },
                    {
                        from: '/addons',
                        to: '/reference/addons',
                    },
                    {
                        from: '/addons/datadog',
                        to: '/reference/addons/datadog',
                    },
                    {
                        from: '/addons/slack',
                        to: '/reference/addons/slack',
                    },
                    {
                        from: '/addons/teams',
                        to: '/reference/addons/teams',
                    },
                    {
                        from: '/addons/webhook',
                        to: '/reference/addons/webhook',
                    },
                    {
                        from: '/guides/feature_updates_to_slack',
                        to: '/how-to/how-to-send-feature-updates-to-slack-deprecated',
                    },
                    {
                        from: ['/integrations/integrations', '/integrations'],
                        to: '/reference/integrations',
                    },
                    {
                        from: '/integrations/jira_server_plugin_installation',
                        to: '/reference/integrations/jira-server-plugin-installation',
                    },
                    {
                        from: '/integrations/jira_server_plugin_usage',
                        to: '/reference/integrations/jira-server-plugin-usage',
                    },
                    {
                        from: [
                            '/sdks',
                            '/user_guide/client-sdk',
                            '/client-sdk',
                            '/user_guide/connect_sdk',
                            '/sdks/community',
                        ],
                        to: '/reference/sdks',
                    },
                    {
                        from: '/sdks/go_sdk',
                        to: '/reference/sdks/go',
                    },
                    {
                        from: '/sdks/java_sdk',
                        to: '/reference/sdks/java',
                    },
                    {
                        from: '/sdks/node_sdk',
                        to: '/reference/sdks/node',
                    },
                    {
                        from: '/sdks/php_sdk',
                        to: '/reference/sdks/php',
                    },
                    {
                        from: '/sdks/python_sdk',
                        to: '/reference/sdks/python',
                    },
                    {
                        from: '/sdks/dot_net_sdk',
                        to: '/reference/sdks/dotnet',
                    },
                    {
                        from: '/sdks/ruby_sdk',
                        to: '/reference/sdks/ruby',
                    },
                    {
                        from: '/sdks/android_proxy_sdk',
                        to: '/reference/sdks/android-proxy',
                    },
                    {
                        from: '/sdks/proxy-ios',
                        to: '/reference/sdks/ios-proxy',
                    },
                    {
                        from: [
                            '/sdks/proxy-javascript',
                            '/sdks/javascript-browser',
                        ],
                        to: '/reference/sdks/javascript-browser',
                    },
                    {
                        from: ['/sdks/proxy-react', '/sdks/react'],
                        to: '/reference/sdks/react',
                    },
                    {
                        from: '/sdks/proxy-vue',
                        to: '/reference/sdks/vue',
                    },
                    {
                        from: '/sdks/proxy-svelte',
                        to: '/reference/sdks/svelte',
                    },
                    {
                        from: [
                            '/user_guide/native_apps',
                            '/user_guide/proxy-api',
                            '/sdks/unleash-proxy',
                        ],
                        to: '/reference/unleash-proxy',
                    },
                    {
                        to: '/how-to/how-to-create-feature-toggles',
                        from: '/user_guide/create_feature_toggle',
                    },
                    {
                        to: '/reference/activation-strategies',
                        from: [
                            '/user_guide/control_rollout',
                            '/user_guide/activation_strategy',
                        ],
                    },
                    {
                        from: '/user_guide/environments',
                        to: '/reference/environments',
                    },
                    {
                        from: '/user_guide/projects',
                        to: '/reference/projects',
                    },
                    {
                        from: '/user_guide/rbac',
                        to: '/reference/rbac',
                    },
                    {
                        from: '/user_guide/technical_debt',
                        to: '/reference/technical-debt',
                    },
                    {
                        from: '/user_guide/unleash_context',
                        to: '/reference/unleash-context',
                    },
                    {
                        from: '/user_guide/user-management',
                        to: '/how-to/how-to-add-users-to-unleash',
                    },
                    {
                        from: '/user_guide/v4-whats-new',
                        to: '/reference/whats-new-v4',
                    },
                    {
                        from: '/user_guide/important-concepts',
                        to: '/tutorials/important-concepts',
                    },
                    {
                        from: [
                            '/user_guide/quickstart',
                            '/docs/getting_started',
                        ],
                        to: '/tutorials/quickstart',
                    },
                    {
                        from: '/user_guide/unleash_overview',
                        to: '/tutorials/unleash-overview',
                    },
                    {
                        from: '/api/basic-auth',
                        to: '/reference/api/legacy/unleash/basic-auth',
                    },
                    {
                        from: '/api',
                        to: '/reference/api/legacy/unleash',
                    },
                    {
                        from: '/api/admin/addons',
                        to: '/reference/api/legacy/unleash/admin/addons',
                    },
                    {
                        from: '/api/admin/context',
                        to: '/reference/api/legacy/unleash/admin/context',
                    },
                    {
                        from: '/api/admin/events',
                        to: '/reference/api/legacy/unleash/admin/events',
                    },
                    {
                        from: '/api/admin/feature-toggles-v2',
                        to: '/reference/api/legacy/unleash/admin/features-v2',
                    },
                    {
                        from: '/api/admin/feature-types',
                        to: '/reference/api/legacy/unleash/admin/feature-types',
                    },
                    {
                        from: '/api/admin/features',
                        to: '/reference/api/legacy/unleash/admin/features',
                    },
                    {
                        from: '/api/admin/features-archive',
                        to: '/reference/api/legacy/unleash/admin/archive',
                    },
                    {
                        from: '/api/admin/metrics',
                        to: '/reference/api/legacy/unleash/admin/metrics',
                    },
                    {
                        from: '/api/admin/projects',
                        to: '/reference/api/legacy/unleash/admin/projects',
                    },
                    {
                        from: '/api/admin/segments',
                        to: '/reference/api/legacy/unleash/admin/segments',
                    },
                    {
                        from: '/api/admin/state',
                        to: '/reference/api/legacy/unleash/admin/state',
                    },
                    {
                        from: '/api/admin/strategies',
                        to: '/reference/api/legacy/unleash/admin/strategies',
                    },
                    {
                        from: '/api/admin/tags',
                        to: '/reference/api/legacy/unleash/admin/tags',
                    },
                    {
                        from: '/api/admin/user-admin',
                        to: '/reference/api/legacy/unleash/admin/user-admin',
                    },
                    {
                        from: '/api/client/features',
                        to: '/reference/api/legacy/unleash/client/features',
                    },
                    {
                        from: '/api/client/metrics',
                        to: '/reference/api/legacy/unleash/client/metrics',
                    },
                    {
                        from: '/api/client/register',
                        to: '/reference/api/legacy/unleash/client/register',
                    },
                    {
                        from: '/api/internal/internal',
                        to: '/reference/api/legacy/unleash/internal/prometheus',
                    },
                    {
                        from: '/api/internal/health',
                        to: '/reference/api/legacy/unleash/internal/health',
                    },
                    {
                        from: '/help',
                        to: '/',
                    },
                ].map(addDocsRoutePrefix), // add /docs prefixes
                createRedirects: function (toPath) {
                    if (
                        toPath.indexOf('/docs/') === -1 &&
                        toPath.indexOf('index.html') === -1
                    ) {
                        return `/docs/${toPath}`;
                    }
                },
            },
        ],
        [
            'docusaurus-plugin-openapi-docs',
            {
                id: 'api-operations',
                docsPluginId: 'classic',
                config: {
                    server: {
                        specPath:
                            process.env.OPENAPI_SOURCE === 'localhost'
                                ? 'http://localhost:4242/docs/openapi.json'
                                : 'https://us.app.unleash-hosted.com/ushosted/docs/openapi.json',
                        outputDir: 'docs/reference/api/unleash',
                        sidebarOptions: {
                            groupPathsBy: 'tag',
                            categoryLinkSource: 'tag',
                        },
                    },
                },
            },
        ],
        [
            'docusaurus-plugin-remote-content',
            {
                // more info at https://github.com/rdilweb/docusaurus-plugin-remote-content#options
                name: 'content-sdks',
                sourceBaseUrl: 'https://raw.githubusercontent.com/Unleash/', // gets prepended to all of the documents when fetching
                outDir: 'docs/generated', // the base directory to output to.
                documents: sdks.urls, // the file names to download
                modifyContent: sdks.modifyContent,
            },
        ],
        [
            'docusaurus-plugin-remote-content',
            {
                // more info at https://github.com/rdilweb/docusaurus-plugin-remote-content#options
                name: 'content-external',
                sourceBaseUrl: 'https://raw.githubusercontent.com/Unleash/', // gets prepended to all of the documents when fetching
                outDir: 'docs/generated/', // the base directory to output to.
                documents: edgeAndProxy.urls, // the file names to download
                modifyContent: edgeAndProxy.modifyContent,
            },
        ],
    ],
    themes: [
        'docusaurus-theme-openapi-docs', // Allows use of @theme/ApiItem and other components
        '@docusaurus/theme-mermaid',
    ],
    scripts: [
        {
            src: 'https://widget.kapa.ai/kapa-widget.bundle.js',
            'data-website-id': '1d187510-1726-4011-b0f7-62742ae064ee',
            'data-project-name': 'Unleash',
            'data-project-color': '#1A4049',
            'data-project-logo':
                'https://cdn.getunleash.io/uploads/2022/05/logo.png',
            async: true,
        },
    ],
};
