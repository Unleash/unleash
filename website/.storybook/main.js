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
};
