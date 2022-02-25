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

        const rules = config.module.rules.map((rule) => {
            if (rule.test.toString() !== '/\\.css$/') {
                return rule;
            }

            const use = rule.use.map((u) => {
                const { loader } = u;

                if (!loader || !loader.includes('/css-loader/')) {
                    return u;
                }

                const options = {
                    ...u.options,
                    modules: true,
                };

                return {
                    ...u,
                    options,
                };
            });

            return {
                ...rule,
                use,
            };
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
