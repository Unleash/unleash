import { fromJS, List, Map } from 'immutable';
import { RECEIVE_ALL_APPLICATIONS, RECEIVE_APPLICATION, UPDATE_APPLICATION_FIELD, DELETE_APPLICATION } from './actions';

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
        case DELETE_APPLICATION: {
            const index = state.get('list').findIndex(item => item.appName === action.appName);
            const result = state.removeIn(['list', index]);
            return result.removeIn(['apps', action.appName]);
        }
        default:
            return state;
    }
};

export default store;
