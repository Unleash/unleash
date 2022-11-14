/** @type {import('@docusaurus/types').DocusaurusConfig} */
module.exports = {
    title: 'Unleash',
    tagline: 'The enterprise ready feature toggle service',
    url: 'https://docs.getunleash.io',
    baseUrl: '/',
    onBrokenLinks: 'throw',
    onBrokenMarkdownLinks: 'warn',
    favicon: 'img/favicon.ico',
    organizationName: 'Unleash', // Usually your GitHub org/user name.
    projectName: 'unleash.github.io', // Usually your repo name.
    trailingSlash: false,
    customFields: {
        // expose env vars etc here
        unleashProxyUrl: process.env.UNLEASH_PROXY_URL,
        unleashProxyClientKey: process.env.UNLEASH_PROXY_CLIENT_KEY,
        unleashFeedbackTargetUrl: process.env.UNLEASH_FEEDBACK_TARGET_URL,
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
        announcementBar: {
            id: 'strategy-constraints-announcement',
            content:
                '🚀 Unleash brings powerful Constraints feature to OSS users. <a href=https://www.getunleash.io/blog/unleash-brings-powerful-constraints-feature-to-oss-users title="Unleash blog: Constraints are now available to open-source users">Read more</a> →',
            isCloseable: true,
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
            additionalLanguages: [
                'csharp',
                'http',
                'java',
                'kotlin',
                'php',
                'ruby',
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
                            href: 'https://github.com/orgs/Unleash/projects/5',
                        },
                    ],
                },
                {
                    title: 'Community',
                    items: [
                        {
                            label: 'Stack Overflow',
                            href: 'https://stackoverflow.com/questions/tagged/unleash',
                        },
                        {
                            label: 'Slack',
                            href: 'https://slack.unleash.run/',
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
                        to: '/sdks',
                        from: [
                            '/user_guide/client-sdk',
                            '/client-sdk',
                            '/user_guide/connect_sdk',
                            '/sdks/community',
                        ],
                    },
                    {
                        to: '/user_guide/api-token',
                        from: '/deploy/user_guide/api-token',
                    },
                    {
                        to: '/sdks/unleash-proxy',
                        from: '/user_guide/native_apps/',
                    },
                    {
                        to: '/advanced/toggle_variants',
                        from: '/toggle_variants',
                    },
                    {
                        to: '/integrations',
                        from: '/integrations/integrations',
                    },
                    {
                        to: '/user_guide/activation_strategy',
                        from: '/user_guide/control_rollout',
                    },
                    {
                        from: '/advanced/impression_data',
                        to: '/advanced/impression-data',
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
                ],
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
    ],
    themes: ['docusaurus-theme-openapi-docs'], // Allows use of @theme/ApiItem and other components
};
