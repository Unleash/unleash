/** @type {import('@docusaurus/types').DocusaurusConfig} */
module.exports = {
    title: "Unleash",
    tagline: "The enterprise ready feature toggle service",
    url: "https://docs.getunleash.io",
    baseUrl: "/",
    onBrokenLinks: "throw",
    onBrokenMarkdownLinks: "warn",
    favicon: "img/favicon.ico",
    organizationName: "Unleash", // Usually your GitHub org/user name.
    projectName: "unleash.github.io", // Usually your repo name.
    themeConfig: {
        defaultMode: 'light',
        disableSwitch: true,
        respectPrefersColorScheme: false,
        navbar: {
            title: "Unleash",
            logo: {
                alt: "Unleash logo",
                src: "img/logo.svg"
            },
            items: [
                { to: "/", label: "Documentation" },
                { to: "deploy/getting_started", label: "Deploy and manage" },
                { to: "integrations/integrations", label: "Integrations" },
                { to: "/api", label: "API" },
                { href: "https://www.getunleash.io/plans", label: "Enterprise", position: 'right' },
                {
                    href: 'https://github.com/Unleash/unleash',
                    position: 'right',
                    className: 'header-github-link',
                    'aria-label': 'GitHub repository',
                },
            ]
        },
        footer: {
            style: "dark",
            links: [
                {
                    title: "Docs",
                    items: [
                        {
                            label: "Docs",
                            to: "/"
                        }
                    ]
                },
                {
                    title: "Community",
                    items: [
                        {
                            label: "Stack Overflow",
                            href: "https://stackoverflow.com/questions/tagged/unleash"
                        },
                        {
                            label: "Slack",
                            href: "https://join.slack.com/t/unleash-community/shared_invite/zt-8b6l1uut-LL67kLpIXm9bcN3~6RVaRQ"
                        },
                        {
                            label: "Twitter",
                            href: "https://twitter.com/getunleash"
                        }
                    ]
                },
                {
                    title: "More",
                    items: [
                        {
                            label: "GitHub",
                            href: "https://github.com/Unleash/unleash"
                        }
                    ]
                }
            ],
            copyright: `Copyright © ${new Date().getFullYear()} Unleash. Built with Docusaurus.`,
            logo: {
                src: 'img/logo.svg',
                alt: 'Unleash logo'
            }
        },
        gtag: {
            trackingID: "UA-134882379-1"
        },
        image: 'img/logo.png'
    },
    presets: [
        [
            "@docusaurus/preset-classic",
            {
                docs: {
                    sidebarPath: require.resolve("./sidebars.js"),
                    // Please change this to your repo.
                    editUrl: "https://github.com/Unleash/unleash/edit/master/websitev2/",
                    routeBasePath: "/"
                },
                theme: {
                    customCss: require.resolve("./src/css/custom.css")
                }
            }
        ]
    ],
    plugins: [
        [
            '@docusaurus/plugin-client-redirects',
            {
                fromExtensions: ['html', 'htm'],
                redirects: [
                    {
                        to: '/sdks',
                        from: ['/user_guide/client-sdk', '/client-sdk']
                    },
                    {
                        to: '/advanced/toggle_variants',
                        from: '/toggle_variants'
                    }
                ],
                createRedirects: function (toPath) {
                    if (toPath.indexOf("/docs/") === -1 && toPath.indexOf("index.html") === -1) {
                        return `/docs/${toPath}`
                    }
                }
            }
        ]
    ]
};
