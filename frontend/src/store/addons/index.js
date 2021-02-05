import { Map as $Map, List, fromJS } from 'immutable';
import { RECEIVE_ADDON_CONFIG, ADD_ADDON_CONFIG, REMOVE_ADDON_CONFIG, UPDATE_ADDON_CONFIG } from './actions';
import { USER_LOGOUT, USER_LOGIN } from '../user/actions';

function getInitState() {
    return new $Map({
        providers: new List(),
        addons: new List(),
    });
}

const strategies = (state = getInitState(), action) => {
    switch (action.type) {
        case RECEIVE_ADDON_CONFIG:
            return fromJS(action.value);
        case ADD_ADDON_CONFIG: {
            return state.update('addons', arr => arr.push(fromJS(action.value)));
        }
        case REMOVE_ADDON_CONFIG:
            return state.update('addons', arr => arr.filter(a => a.get('id') !== action.value.id));
        case UPDATE_ADDON_CONFIG: {
            const index = state.get('addons').findIndex(item => item.get('id') === action.value.id);
            return state.setIn(['addons', index], fromJS(action.value));
        }
        case USER_LOGOUT:
        case USER_LOGIN:
            return getInitState();
        default:
            return state;
    }
};

export default strategies;
