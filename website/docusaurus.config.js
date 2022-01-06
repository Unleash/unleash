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
    themeConfig: {
        defaultMode: 'light',
        disableSwitch: true,
        respectPrefersColorScheme: false,
        algolia: {
            apiKey: '9772249a7262b377ac876853d32bd760',
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
                    to: '/',
                    label: 'Documentation',
                    activeBaseRegex: '(user_guide|sdks|addons|advanced)',
                },
                { to: 'deploy/getting_started', label: 'Deploy and manage' },
                { to: 'integrations/integrations', label: 'Integrations' },
                { to: '/api', label: 'API' },
                {
                    href: 'https://www.getunleash.io/plans',
                    label: 'Unleash Enterprise',
                    position: 'right',
                },
                {
                    href: 'https://github.com/Unleash/unleash',
                    position: 'right',
                    className: 'header-github-link',
                    'aria-label': 'GitHub repository',
                },
            ],
        },
        prism: {
            additionalLanguages: ['java', 'swift', 'ruby', 'csharp', 'kotlin', 'php'],
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
                            label: 'Open-Source',
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
                            href:
                                'https://stackoverflow.com/questions/tagged/unleash',
                        },
                        {
                            label: 'Slack',
                            href:
                                'https://join.slack.com/t/unleash-community/shared_invite/zt-8b6l1uut-LL67kLpIXm9bcN3~6RVaRQ',
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
        gtag: {
            trackingID: 'UA-134882379-1',
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
                        'https://github.com/Unleash/unleash/edit/master/website/',
                    routeBasePath: '/',
                    remarkPlugins: [
                        [require('@docusaurus/remark-plugin-npm2yarn'), {sync: true}]
                    ]
                },
                theme: {
                    customCss: require.resolve('./src/css/custom.css'),
                },
            },
        ],
    ],
    plugins: [
        [
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
                ],
                createRedirects: function(toPath) {
                    if (
                        toPath.indexOf('/docs/') === -1 &&
                        toPath.indexOf('index.html') === -1
                    ) {
                        return `/docs/${toPath}`;
                    }
                },
            },
        ],
    ],
};
