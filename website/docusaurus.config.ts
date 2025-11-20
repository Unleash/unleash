import type { Config } from '@docusaurus/types';

import { sdks } from './remote-content/sdks';
import { docs as services } from './remote-content/services';
import pluginNpm2Yarn from '@docusaurus/remark-plugin-npm2yarn';

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

const getUnleashRepoStars = async () => {
    try {
        const response = await fetch(
            `https://api.github.com/repos/unleash/unleash`,
        );
        const data = await response.json();

        const unleashRepoStars = data.stargazers_count;
        const formattedStars =
            unleashRepoStars >= 1000
                ? `${(unleashRepoStars / 1000).toFixed(1)}k`
                : unleashRepoStars?.toString() || '';
        return formattedStars;
    } catch (e) {
        console.error('Error fetching Unleash repo stars', e);
        return '';
    }
};

export default async function createConfigAsync(): Promise<Config> {
    const stars = await getUnleashRepoStars();
    return {
        future: {
            experimental_faster: true, // turns Docusaurus Faster on globally
        },
        title: 'Unleash Documentation',
        tagline: 'The enterprise ready feature flag service',
        url: 'https://docs.getunleash.io',
        baseUrl: '/',
        onBrokenLinks: 'throw',
        onBrokenMarkdownLinks: 'throw',
        favicon: 'img/favicon.ico',
        organizationName: 'Unleash', // Usually your GitHub org/user name.
        projectName: 'unleash.github.io', // Usually your repo name.
        trailingSlash: false,
        markdown: {
            mermaid: true,
        },
        customFields: {
            // expose env vars etc here
            environment: process.env.NODE_ENV,
        },
        headTags: [
            {
                tagName: 'link',
                attributes: {
                    rel: 'preload',
                    href: '/img/unleash_logo_dark.svg',
                    as: 'image',
                    type: 'image/svg+xml',
                },
            },
        ],
        themeConfig: {
            defaultMode: 'light',
            disableSwitch: true,
            respectPrefersColorScheme: false,
            algolia: {
                appId: '5U05JI5NE1',
                apiKey: 'dc9c4491fcf9143ee34015f22d1dd9d6',
                indexName: 'getunleash',
            },
            theme: {
                customCss: './src/css/custom.css',
            },
            metadata: [
                { name: 'og:image:width', content: '1200' },
                { name: 'og:image:height', content: '630' },
            ],
            navbar: {
                logo: {
                    alt: 'Unleash logo',
                    src: 'img/unleash_logo_dark.svg',
                    srcDark: 'img/unleash_logo_white.svg',
                    href: 'https://www.getunleash.io',
                },
                items: [
                    {
                        type: 'html',
                        value: '<a href="https://www.getunleash.io/enterprise-feature-management-platform" class="navbar__item navbar__link">Product</a>',
                        position: 'left',
                    },
                    {
                        type: 'html',
                        value: '<a href="https://www.getunleash.io/plans" class="navbar__item navbar__link">Plans</a>',
                        position: 'left',
                    },
                    {
                        type: 'html',
                        value: '<a href="https://www.getunleash.io/blog" class="navbar__item navbar__link">Blog</a>',
                        position: 'left',
                    },
                    {
                        type: 'html',
                        value: '<a href="/unleash-academy/introduction" class="navbar__item navbar__link">Academy</a>',
                        position: 'left',
                    },
                    {
                        type: 'html',
                        position: 'right',
                        value: `<a
href="https://github.com/Unleash/unleash"
aria-label="Unleash GitHub repository"
class="header-github-link"
>
<svg width="28px" height="28px" viewBox="0 0 21 20"><path fill="currentColor" d="M10.537 1.833c-4.602 0-8.333 3.544-8.333 7.917 0 4.373 3.73 7.917 8.333 7.917s8.334-3.544 8.334-7.917c0-4.373-3.73-7.917-8.334-7.917Zm0 1.584c3.676 0 6.667 2.842 6.667 6.333 0 .371-.039.736-.104 1.089a4.345 4.345 0 0 0-.86-.1 6.375 6.375 0 0 0-.859.075 2.76 2.76 0 0 0 .156-.89c0-.761-.39-1.47-1.015-2.054.172-.61.342-1.655-.104-2.078a2.762 2.762 0 0 0-2.084.94 5.684 5.684 0 0 0-1.276-.149 5.91 5.91 0 0 0-1.64.248l.156-.124s-.733-.965-2.083-.965c-.472.452-.258 1.596-.079 2.177-.638.579-1.041 1.262-1.041 2.004 0 .26.065.507.13.742-.231-.024-1.064-.098-1.406-.098-.303 0-.772.067-1.146.148a5.912 5.912 0 0 1-.078-.965c0-3.491 2.991-6.333 6.666-6.333Zm-5.442 7.347c.329 0 1.328.112 1.458.124.016.043.033.084.052.124-.358-.031-1.051-.078-1.51-.025-.306.034-.697.14-1.042.223-.026-.1-.059-.195-.078-.297.365-.074.843-.149 1.12-.149Zm11.146.174c.332.003.634.055.833.098-.01.053-.04.096-.052.149a5.042 5.042 0 0 0-.964-.124c-.195-.003-.508.007-.781.025.013-.025.016-.05.026-.074.283-.037.645-.078.938-.074Zm-10.625.222c.468.003.908.034 1.093.05.437.773 1.319 1.345 2.683 1.583a2.621 2.621 0 0 0-.86.718c-.195.015-.4.024-.599.024-.58 0-.94-.492-1.25-.915-.312-.424-.696-.47-.911-.495-.218-.025-.293.093-.182.173.634.464.862 1.015 1.12 1.51.23.445.715.692 1.25.692h.103a1.33 1.33 0 0 0-.026.248v.865c-1.923-.739-3.388-2.3-3.932-4.23.342-.08.726-.164 1.016-.198.133-.016.302-.028.495-.025Zm10.442.1c.375.008.707.076.912.123-.46 1.639-1.592 3.003-3.1 3.835v-.47c0-.675-.56-1.54-1.353-1.955 1.318-.229 2.177-.776 2.63-1.51.316-.02.687-.03.911-.024Zm-5.104 3.24a.41.41 0 0 1 .417.396v1.138c-.274.034-.55.05-.834.05v-1.188a.41.41 0 0 1 .417-.396Zm-1.667.792a.41.41 0 0 1 .417.396v.346a7.438 7.438 0 0 1-.833-.148v-.198a.41.41 0 0 1 .416-.396Zm3.334 0c.202 0 .377.139.416.321-.27.106-.546.201-.833.273v-.198a.41.41 0 0 1 .417-.396Z"/></svg>
</a>`,
                        className: 'show-at-small-sizes',
                    },
                    {
                        type: 'html',
                        position: 'right',
                        value: `<a
    href="https://github.com/Unleash/unleash"
    aria-label="Unleash GitHub repository"
    class="header-github-link navbar-link-outlined"
  >
    <svg width="28px" height="28px" viewBox="0 0 21 20"><path fill="currentColor" d="M10.537 1.833c-4.602 0-8.333 3.544-8.333 7.917 0 4.373 3.73 7.917 8.333 7.917s8.334-3.544 8.334-7.917c0-4.373-3.73-7.917-8.334-7.917Zm0 1.584c3.676 0 6.667 2.842 6.667 6.333 0 .371-.039.736-.104 1.089a4.345 4.345 0 0 0-.86-.1 6.375 6.375 0 0 0-.859.075 2.76 2.76 0 0 0 .156-.89c0-.761-.39-1.47-1.015-2.054.172-.61.342-1.655-.104-2.078a2.762 2.762 0 0 0-2.084.94 5.684 5.684 0 0 0-1.276-.149 5.91 5.91 0 0 0-1.64.248l.156-.124s-.733-.965-2.083-.965c-.472.452-.258 1.596-.079 2.177-.638.579-1.041 1.262-1.041 2.004 0 .26.065.507.13.742-.231-.024-1.064-.098-1.406-.098-.303 0-.772.067-1.146.148a5.912 5.912 0 0 1-.078-.965c0-3.491 2.991-6.333 6.666-6.333Zm-5.442 7.347c.329 0 1.328.112 1.458.124.016.043.033.084.052.124-.358-.031-1.051-.078-1.51-.025-.306.034-.697.14-1.042.223-.026-.1-.059-.195-.078-.297.365-.074.843-.149 1.12-.149Zm11.146.174c.332.003.634.055.833.098-.01.053-.04.096-.052.149a5.042 5.042 0 0 0-.964-.124c-.195-.003-.508.007-.781.025.013-.025.016-.05.026-.074.283-.037.645-.078.938-.074Zm-10.625.222c.468.003.908.034 1.093.05.437.773 1.319 1.345 2.683 1.583a2.621 2.621 0 0 0-.86.718c-.195.015-.4.024-.599.024-.58 0-.94-.492-1.25-.915-.312-.424-.696-.47-.911-.495-.218-.025-.293.093-.182.173.634.464.862 1.015 1.12 1.51.23.445.715.692 1.25.692h.103a1.33 1.33 0 0 0-.026.248v.865c-1.923-.739-3.388-2.3-3.932-4.23.342-.08.726-.164 1.016-.198.133-.016.302-.028.495-.025Zm10.442.1c.375.008.707.076.912.123-.46 1.639-1.592 3.003-3.1 3.835v-.47c0-.675-.56-1.54-1.353-1.955 1.318-.229 2.177-.776 2.63-1.51.316-.02.687-.03.911-.024Zm-5.104 3.24a.41.41 0 0 1 .417.396v1.138c-.274.034-.55.05-.834.05v-1.188a.41.41 0 0 1 .417-.396Zm-1.667.792a.41.41 0 0 1 .417.396v.346a7.438 7.438 0 0 1-.833-.148v-.198a.41.41 0 0 1 .416-.396Zm3.334 0c.202 0 .377.139.416.321-.27.106-.546.201-.833.273v-.198a.41.41 0 0 1 .417-.396Z"/></svg>
    <span>Star</span>
    <strong>${stars}</strong>
  </a>`,
                        className: 'hide-at-small-sizes',
                    },
                    {
                        type: 'html',
                        position: 'right',
                        value: '<span class="navbar-separator"></span>',
                        className: 'hide-at-small-sizes',
                    },
                    {
                        type: 'html',
                        value: '<a href="https://app.unleash-hosted.com/sign-in" target="_blank" rel="noopener noreferrer" class="navbar__link">Sign in</a>',
                        position: 'right',
                        className: 'hide-at-small-sizes',
                    },
                    {
                        type: 'html',
                        position: 'right',
                        value: '<a href="https://www.getunleash.io/pricing" target="_blank" rel="noopener noreferrer" class="navbar__link navbar-link-solid">Start free trial</a>',
                        className: 'hide-at-small-sizes',
                    },
                ],
            },
            prism: {
                additionalLanguages: [
                    'csharp',
                    'dart',
                    'java',
                    'php',
                    'ruby',
                    'bash',
                    'diff',
                ],
            },
            languageTabs: [
                {
                    highlight: 'bash',
                    language: 'curl',
                },
                {
                    highlight: 'python',
                    language: 'python',
                    variant: 'requests',
                },
                {
                    highlight: 'go',
                    language: 'go',
                },
                {
                    highlight: 'javascript',
                    language: 'nodejs',
                    variant: 'native',
                },
                {
                    highlight: 'ruby',
                    language: 'ruby',
                },
                {
                    highlight: 'csharp',
                    language: 'csharp',
                    variant: 'httpclient',
                },
                {
                    highlight: 'php',
                    language: 'php',
                },
                {
                    highlight: 'java',
                    language: 'java',
                },
                {
                    highlight: 'powershell',
                    language: 'powershell',
                },
            ],
            footer: {
                links: [
                    {
                        title: 'Server SDKs',
                        items: [
                            {
                                label: 'Node.js',
                                to: '/reference/sdks/node',
                            },
                            {
                                label: 'Java',
                                to: '/reference/sdks/java',
                            },
                            {
                                label: 'Go',
                                to: '/reference/sdks/go',
                            },
                            {
                                label: 'Rust',
                                to: '/reference/sdks/rust',
                            },
                            {
                                label: 'Ruby',
                                to: '/reference/sdks/ruby',
                            },
                            {
                                label: 'Python',
                                to: '/reference/sdks/python',
                            },
                            {
                                label: '.NET',
                                to: '/reference/sdks/dotnet',
                            },
                            {
                                label: 'PHP',
                                to: '/reference/sdks/php',
                            },
                            {
                                label: 'All SDKs',
                                to: '/reference/sdks',
                            },
                        ],
                    },
                    {
                        title: 'Frontend SDKs',
                        items: [
                            {
                                label: 'JavaScript',
                                to: '/reference/sdks/javascript-browser',
                            },
                            {
                                label: 'React',
                                to: '/reference/sdks/react',
                            },
                            {
                                label: 'Next.js',
                                to: '/reference/sdks/next-js',
                            },
                            {
                                label: 'Vue',
                                to: '/reference/sdks/vue',
                            },
                            {
                                label: 'iOS',
                                to: '/reference/sdks/ios',
                            },
                            {
                                label: 'Android',
                                to: '/reference/sdks/android',
                            },
                            {
                                label: 'Flutter',
                                to: '/reference/sdks/flutter',
                            },
                        ],
                    },
                    {
                        title: 'Feature Flag use cases',
                        items: [
                            {
                                label: 'Secure, scalable feature flags',
                                to: '/topics/feature-flags/feature-flag-best-practices',
                            },
                            {
                                label: 'Rollbacks',
                                href: 'https://www.getunleash.io/feature-flag-use-cases-rollbacks',
                            },
                            {
                                label: 'FedRAMP, SOC2, ISO2700 compliance',
                                to: '/using-unleash/compliance/compliance-overview',
                            },
                            {
                                label: 'Progressive or gradual rollouts',
                                to: '/feature-flag-tutorials/use-cases/gradual-rollout',
                            },
                            {
                                label: 'Trunk-based development',
                                to: '/feature-flag-tutorials/use-cases/trunk-based-development',
                            },
                            {
                                label: 'Software kill switches',
                                href: 'https://www.getunleash.io/feature-flag-use-cases-software-kill-switches',
                            },
                            {
                                label: 'A/B testing',
                                to: '/feature-flag-tutorials/use-cases/a-b-testing',
                            },
                            {
                                label: 'Feature management',
                                href: 'https://www.getunleash.io/blog/feature-management',
                            },
                            {
                                label: 'Canary releases',
                                href: 'https://www.getunleash.io/blog/canary-deployment-what-is-it',
                            },
                        ],
                    },
                    {
                        title: 'Product',
                        items: [
                            {
                                label: 'Quickstart',
                                to: '/quickstart',
                            },
                            {
                                label: 'Unleash architecture',
                                to: '/understanding-unleash/unleash-overview',
                            },
                            {
                                label: 'Pricing',
                                href: 'https://www.getunleash.io/pricing',
                            },
                            {
                                label: 'Product vision',
                                href: 'https://www.getunleash.io/product-vision',
                            },
                            {
                                label: 'Open live demo',
                                href: 'https://app.unleash-hosted.com/demo/login',
                            },
                            {
                                label: 'Open source',
                                href: 'https://www.getunleash.io/open-source',
                            },
                            {
                                label: 'Enterprise feature management platform',
                                href: 'https://www.getunleash.io/enterprise-feature-management-platform',
                            },
                            {
                                label: 'Unleash vs LaunchDarkly',
                                href: 'https://www.getunleash.io/unleash-vs-launchdarkly',
                            },
                        ],
                    },
                    {
                        title: 'Support',
                        items: [
                            {
                                label: 'Help center',
                                href: 'https://www.getunleash.io/support',
                            },
                            {
                                label: 'Status',
                                href: 'https://unleash.instatus.com',
                            },
                            {
                                label: 'Changelog',
                                href: 'https://github.com/Unleash/unleash/releases',
                            },
                        ],
                    },
                ],
                copyright: `Copyright © ${new Date().getFullYear()} Unleash. Built with Docusaurus.`,
                logo: {
                    src: 'img/unleash_logo_dark_no_label.svg',
                    srcDark: 'img/unleash_logo_white_no_label.svg',
                    alt: 'Unleash logo',
                },
            },
            image: 'img/unleash-preview-1200-630.png',
            imageZoom: {
                // Optional medium-zoom options at
                // https://www.npmjs.com/package/medium-zoom#options
                selector: '.markdown :not(p) > img',
                options: {
                    background: 'var(--ifm-background-color)',
                },
            },
        },
        presets: [
            [
                '@docusaurus/preset-classic',
                {
                    docs: {
                        // Please change this to your repo.
                        editUrl:
                            'https://github.com/Unleash/unleash/edit/main/website/',
                        routeBasePath: '/',
                        remarkPlugins: [[pluginNpm2Yarn, { sync: true }]],
                        docItemComponent: '@theme/ApiItem',
                        sidebarPath: './sidebars.ts',
                        breadcrumbs: true,
                    },
                    theme: {
                        customCss: './src/css/custom.css',
                    },
                    sitemap: {
                        changefreq: 'weekly',
                        lastmod: 'date',
                        priority: 0.5,
                        createSitemapItems: async (params) => {
                            const { defaultCreateSitemapItems, ...rest } =
                                params;
                            const items = await defaultCreateSitemapItems(rest);
                            return items.filter(
                                (item) => !item.url.includes('/page/'),
                            );
                        },
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
                            from: '/advanced/audit_log',
                            to: '/reference/events',
                        },
                        {
                            from: '/reference/event-log',
                            to: '/reference/events',
                        },
                        {
                            from: '/reference/event-types',
                            to: '/reference/events',
                        },
                        {
                            from: '/advanced/archived_toggles',
                            to: '/reference/feature-toggles',
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
                            to: '/reference/feature-toggles',
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
                            from: '/advanced/enterprise-authentication',
                            to: '/reference/sso',
                        },
                        {
                            from: ['/addons', '/reference/addons'],
                            to: '/reference/integrations',
                        },
                        {
                            from: [
                                '/addons/datadog',
                                '/reference/addons/datadog',
                            ],
                            to: '/reference/integrations/datadog',
                        },
                        {
                            from: ['/addons/slack', '/reference/addons/slack'],
                            to: '/reference/integrations/slack',
                        },
                        {
                            from: [
                                '/addons/slack-app',
                                '/reference/addons/slack-app',
                            ],
                            to: '/reference/integrations/slack-app',
                        },
                        {
                            from: ['/addons/teams', '/reference/addons/teams'],
                            to: '/reference/integrations/teams',
                        },
                        {
                            from: [
                                '/addons/webhook',
                                '/reference/addons/webhook',
                            ],
                            to: '/reference/integrations/webhook',
                        },
                        {
                            from: [
                                '/integrations/integrations',
                                '/integrations',
                            ],
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
                            from: [
                                '/sdks/android_proxy_sdk',
                                '/reference/sdks/android-proxy',
                            ],
                            to: '/reference/sdks/android',
                        },
                        {
                            from: [
                                '/sdks/proxy-ios',
                                '/reference/sdks/ios-proxy',
                            ],
                            to: '/reference/sdks/ios',
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
                            from: ['/user_guide/rbac', '/advanced/groups'],
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
                            from: '/user_guide/v4-whats-new',
                            to: '/reference/whats-new-v4',
                        },
                        {
                            from: [
                                '/user_guide/quickstart',
                                '/docs/getting_started',
                                '/tutorials/quickstart',
                                '/tutorials/getting-started',
                            ],
                            to: '/quickstart',
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
                        {
                            from: ['/tutorials/academy', '/unleash-academy'],
                            to: '/unleash-academy/introduction',
                        },
                        {
                            from: '/tutorials/academy-foundational',
                            to: '/unleash-academy/foundational',
                        },
                        {
                            from: '/tutorials/academy-advanced-for-devs',
                            to: '/unleash-academy/advanced-for-devs',
                        },
                        {
                            from: '/tutorials/academy-managing-unleash-for-devops',
                            to: '/unleash-academy/managing-unleash-for-devops',
                        },
                        {
                            from: [
                                '/tutorials/unleash-overview',
                                '/user_guide/unleash_overview',
                            ],
                            to: '/understanding-unleash/unleash-overview',
                        },
                        {
                            from: [
                                '/tutorials/managing-constraints',
                                '/topics/managing-constraints',
                            ],
                            to: '/understanding-unleash/managing-constraints',
                        },
                        {
                            from: [
                                '/tutorials/the-anatomy-of-unleash',
                                '/topics/the-anatomy-of-unleash',
                            ],
                            to: '/understanding-unleash/the-anatomy-of-unleash',
                        },
                        {
                            from: [
                                '/tutorials/data-collection',
                                '/topics/data-collection',
                            ],
                            to: '/understanding-unleash/data-collection',
                        },
                        {
                            from: [
                                '/reference/deploy/environment-import-export',
                                '/deploy/environment-import-export',
                            ],
                            to: '/how-to/how-to-environment-import-export',
                        },
                        {
                            from: [
                                '/topics/feature-flags/runtime-control',
                                '/topics/feature-flags/never-expose-pii',
                                '/topics/feature-flags/evaluate-flags-close-to-user',
                                '/topics/feature-flags/scale-horizontally',
                                '/topics/feature-flags/limit-payloads',
                                '/topics/feature-flags/availability-over-consistency',
                                '/topics/feature-flags/short-lived-feature-flags',
                                '/topics/feature-flags/unique-names',
                                '/topics/feature-flags/democratize-feature-flag-access',
                                '/topics/feature-flags/prioritize-ux',
                                '/topics/feature-flags/enable-traceability',
                            ],
                            to: '/topics/feature-flags/feature-flag-best-practices',
                        },
                        {
                            from: [
                                '/topics/feature-flag-migration/feature-flag-migration-scope',
                                '/topics/feature-flag-migration/business-case-feature-flag-migration',
                                '/topics/feature-flag-migration/planning-feature-flag-migration',
                                '/topics/feature-flag-migration/how-to-execute-feature-flag-migration',
                                '/topics/feature-flag-migration/onbording-users-to-feature-flag-service',
                            ],
                            to: '/topics/feature-flag-migration/feature-flag-migration-best-practices',
                        },
                        {
                            from: '/topics/a-b-testing',
                            to: '/feature-flag-tutorials/use-cases/a-b-testing',
                        },
                    ].map(addDocsRoutePrefix), // add /docs prefixes
                    createRedirects: (toPath) => {
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
                            specPath: 'docs/generated/openapi.json',
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
                    noRuntimeDownloads: true,
                },
            ],
            [
                'docusaurus-plugin-remote-content',
                {
                    // more info at https://github.com/rdilweb/docusaurus-plugin-remote-content#options
                    name: 'content-external',
                    sourceBaseUrl: 'https://raw.githubusercontent.com/Unleash/', // gets prepended to all of the documents when fetching
                    outDir: 'docs/generated/', // the base directory to output to.
                    documents: services.urls, // the file names to download
                    modifyContent: services.modifyContent,
                    noRuntimeDownloads: true,
                },
            ],
            'plugin-image-zoom',
        ],
        themes: [
            'docusaurus-theme-openapi-docs', // Allows use of @theme/ApiItem and other components
            '@docusaurus/theme-mermaid',
        ],
    };
}
