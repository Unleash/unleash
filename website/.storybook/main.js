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

        config.resolve.alias = {
            ...config.resolve.alias,
            '@site': path.resolve(__dirname, '../'),
        };

        let cssRules = [];
        const rules = config.module.rules.map((rule) => {
            if (rule.test.toString() === '/\\.css$/') {
                cssRules.push(JSON.parse(JSON.stringify(rule)));

                return {
                    ...rule,
                    exclude: /\.module\.css$/,
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
