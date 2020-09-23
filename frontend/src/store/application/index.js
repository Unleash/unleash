import { fromJS, List, Map } from 'immutable';
import { RECEIVE_ALL_APPLICATIONS, RECEIVE_APPLICATION, UPDATE_APPLICATION_FIELD } from './actions';
import { USER_LOGOUT, USER_LOGIN } from '../user/actions';

function getInitState() {
    return fromJS({ list: [], apps: {} });
}

const store = (state = getInitState(), action) => {
    switch (action.type) {
        case RECEIVE_APPLICATION:
            return state.setIn(['apps', action.value.appName], new Map(action.value));
        case RECEIVE_ALL_APPLICATIONS:
            return state.set('list', new List(action.value.applications));
        case UPDATE_APPLICATION_FIELD:
            return state.setIn(['apps', action.appName, action.key], action.value);
        case USER_LOGOUT:
        case USER_LOGIN:
            return getInitState();
        default:
            return state;
    }
};

export default store;
