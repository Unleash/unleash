import '../src/css/custom.css';
import { withRootAttribute } from 'storybook-addon-root-attribute';

export const parameters = {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
        matchers: {
            color: /(background|color)$/i,
            date: /Date$/,
        },
    },
    layout: 'fullscreen',

    // add docusaurus theming to storybook iframes
    rootAttribute: {
        root: 'html',
        attribute: 'data-theme',
        defaultState: {
            name: 'Light',
            value: 'light',
        },
        states: [
            {
                name: 'Dark',
                value: 'dark',
            },
        ],
        tooltip: true,
    },
};

export const decorators = [withRootAttribute];
