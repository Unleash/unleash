import { List, Map as $Map } from 'immutable';
import { RECEIVE_HISTORY, RECEIVE_HISTORY_FOR_TOGGLE } from './actions';
import { USER_LOGOUT, USER_LOGIN } from '../user/actions';

function getInitState() {
    return new $Map({ list: new List(), toggles: new $Map() });
}

const historyStore = (state = getInitState(), action) => {
    switch (action.type) {
        case RECEIVE_HISTORY_FOR_TOGGLE:
            return state.setIn(['toggles', action.value.toggleName], new List(action.value.events));
        case RECEIVE_HISTORY:
            return state.set('list', new List(action.value));
        case USER_LOGOUT:
        case USER_LOGIN:
            return getInitState();
        default:
            return state;
    }
};

export default historyStore;
