import { fromJS } from 'immutable';
import { UPDATE_SETTING } from './actions';
import { USER_LOGOUT, USER_LOGIN } from '../user/actions';

const localStorage = window.localStorage || {
    setItem: () => {},
    getItem: () => {},
};
const basePath = location ? location.pathname : '/';
const SETTINGS = `${basePath}:settings`;

const DEFAULT = fromJS({});

function getInitState() {
    try {
        const state = JSON.parse(localStorage.getItem(SETTINGS));
        return state ? DEFAULT.merge(state) : DEFAULT;
    } catch (e) {
        return DEFAULT;
    }
}

function updateSetting(state, action) {
    const newState = state.updateIn([action.group, action.field], () => action.value);

    localStorage.setItem(SETTINGS, JSON.stringify(newState.toJSON()));
    return newState;
}

const settingStore = (state = getInitState(), action) => {
    switch (action.type) {
        case UPDATE_SETTING:
            return updateSetting(state, action);
        case USER_LOGOUT:
        case USER_LOGIN:
            return getInitState();
        default:
            return state;
    }
};

export default settingStore;
