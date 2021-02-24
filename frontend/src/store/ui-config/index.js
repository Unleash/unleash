import { Map as $Map } from 'immutable';
import { RECEIVE_CONFIG } from './actions';

const localStorage = window.localStorage || {
    setItem: () => {},
    getItem: () => {},
};

const basePath = location ? location.pathname : '/';
const UI_CONFIG = `${basePath}:ui_config`;

const DEFAULT = new $Map({
    headerBackground: undefined,
    name: 'Unleash',
    version: '3.x',
    environment: '',
    slogan: 'The enterprise ready feature toggle service.',
    flags: {},
    links: [
        {
            value: 'User documentation',
            icon: 'library_books',
            href: 'https://unleash.github.io?source=oss',
            title: 'User documentation',
        },
        {
            value: 'GitHub',
            icon: 'c_github',
            href: 'https://github.com/Unleash',
            title: 'Source code on GitHub',
        },
    ],
});

function getInitState() {
    try {
        const state = JSON.parse(localStorage.getItem(UI_CONFIG));
        return state ? DEFAULT.merge(state) : DEFAULT;
    } catch (e) {
        return DEFAULT;
    }
}

function updateConfig(state, config) {
    localStorage.setItem(UI_CONFIG, JSON.stringify(config));
    return state.merge(config);
}

const strategies = (state = getInitState(), action) => {
    switch (action.type) {
        case RECEIVE_CONFIG:
            return updateConfig(state, action.value);
        default:
            return state;
    }
};

export default strategies;
