import { fromJS, Map as $Map } from 'immutable';
import { UPDATE_SETTING } from './actions';

// TODO: provde a mock if localstorage does not exists?
const localStorage = window.localStorage || {};
const SETTINGS = 'settings';

function getInitState () {
    try {
        const state = JSON.parse(localStorage.getItem(SETTINGS));
        return state ? fromJS(state) : new $Map();
    } catch (e) {
        return new $Map();
    }
}

function updateSetting (state, action) {
    let newState;
    if (state.get(action.group)) {
        newState = state.updateIn([action.group, action.field], () => action.value);
    } else {
        newState = state.set(action.group, new $Map())
            .updateIn([action.group, action.field], () => action.value);
    }

    localStorage.setItem(SETTINGS, JSON.stringify(newState.toJSON()));
    return newState;
}

const settingStore = (state = getInitState(), action) => {
    switch (action.type) {
        case UPDATE_SETTING:
            return updateSetting(state, action);
        default:
            return state;
    }
};

export default settingStore;
