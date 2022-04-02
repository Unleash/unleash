const AliasPlugin = require('enhanced-resolve/lib/AliasPlugin');

module.exports = {
    stories: [
        '../src/**/*.stories.mdx',
        '../src/**/*.stories.@(js|jsx|ts|tsx)',
    ],
    addons: [
        '@storybook/addon-links',
        '@storybook/addon-essentials',
        '@storybook/addon-interactions',
        'storybook-addon-root-attribute/register',
    ],
    framework: '@storybook/react',
    staticDirs: [
        {
            from: '../static',
            to: '/',
        },
    ],
    webpackFinal: async (config) => {
        const path = require('path');

        const docusaurusPath = (...paths) =>
            path.resolve(
                __dirname,
                '../',
                'node_modules',
                '@docusaurus',
                ...paths,
            );

        config.resolve.plugins = [
            // add a "layered" approach to theme resolution that matches
            // Docusaurus' theme resolution:
            // https://docusaurus.io/docs/2.0.0-beta.17/advanced/client#theme-aliases
            //
            // First, check to see if the referenced component has
            // been swizzled and exists in `../src/theme`.
            //
            // If it's not there, check the `theme-classic/lib-next/theme` directory in
            // `node_modules`.
            //
            // Finally, if it's not found anywhere else, check the
            // `theme-fallback` directory.
            new AliasPlugin(
                'described-resolve',
                [
                    {
                        name: '@theme',
                        alias: [
                            path.resolve(__dirname, '../', 'src', 'theme'),
                            docusaurusPath(
                                'theme-classic',
                                'lib-next',
                                'theme',
                            ),
                            docusaurusPath(
                                'core',
                                'lib',
                                'client',
                                'theme-fallback',
                            ),
                        ],
                    },
                ],
                'resolve',
            ),
        ];

        config.resolve.alias = {
            ...config.resolve.alias,
            '@site': path.resolve(__dirname, '../'),
            '@docusaurus/theme-common': docusaurusPath(
                'theme-common',
                'src',
                'index.ts',
            ),
            '@docusaurus/utils-common': docusaurusPath('utils-common', 'lib'),
            '@docusaurus/plugin-content-docs': docusaurusPath(
                'plugin-content-docs',
                'src',
            ),
            '@docusaurus': docusaurusPath('core', 'lib', 'client', 'exports'),
            '@generated': path.resolve(__dirname, '../', '.docusaurus'),
        };

        let cssRules = [];
        const rules = config.module.rules.map((rule) => {
            if (rule.test.toString() === '/\\.css$/') {
                cssRules.push(JSON.parse(JSON.stringify(rule)));

                return {
                    ...rule,
                    exclude: /\.module\.css$/,
                };
            } else if (rule.test.toString() === '/\\.(mjs|tsx?|jsx?)$/') {
                return {
                    ...rule,
                    // don't exclude docusaurus files
                    exclude: /node_modules\/(?!@docusaurus)/,
                };
            } else return rule;
        });

        cssRules.forEach((r) => {
            const moduleRule = {
                ...r,
                test: /\.module\.css$/,
                use: r.use.map((use) => {
                    if (
                        typeof use === 'object' &&
                        use.loader.includes('/css-loader/')
                    ) {
                        use.options = {
                            ...use.options,
                            modules: true,
                        };
                    }
                    return use;
                }),
            };
            rules.push(moduleRule);
        });

        return {
            ...config,
            module: {
                ...config.module,
                rules,
            },
        };
    },
};
