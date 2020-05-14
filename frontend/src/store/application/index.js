import { fromJS, List, Map } from 'immutable';
import { RECEIVE_ALL_APPLICATIONS, RECEIVE_APPLICATION } from './actions';
import { USER_LOGOUT, UPDATE_USER } from '../user/actions';

function getInitState() {
    return fromJS({ list: [], apps: {} });
}

const store = (state = getInitState(), action) => {
    switch (action.type) {
        case RECEIVE_APPLICATION:
            return state.setIn(['apps', action.value.appName], new Map(action.value));
        case RECEIVE_ALL_APPLICATIONS:
            return state.set('list', new List(action.value.applications));
        case USER_LOGOUT:
        case UPDATE_USER:
            return getInitState();
        default:
            return state;
    }
};

export default store;
