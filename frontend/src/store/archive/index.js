import { List, Map as $Map } from 'immutable';
import { RECEIVE_ARCHIVE, REVIVE_TOGGLE } from './actions';
import { USER_LOGOUT, USER_LOGIN } from '../user/actions';

function getInitState() {
    return new $Map({ list: new List() });
}

const archiveStore = (state = getInitState(), action) => {
    switch (action.type) {
        case REVIVE_TOGGLE:
            return state.update('list', list => list.filter(item => item.name !== action.value));
        case RECEIVE_ARCHIVE:
            return state.set('list', new List(action.value));
        case USER_LOGOUT:
        case USER_LOGIN:
            return getInitState();
        default:
            return state;
    }
};

export default archiveStore;
