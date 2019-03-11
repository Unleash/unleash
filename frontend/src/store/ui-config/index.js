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
    environment: undefined,
    slogan: 'A product originally created by FINN.no.',
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
