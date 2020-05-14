import { fromJS } from 'immutable';
import { RECEIVE_CLIENT_INSTANCES } from './client-instance-actions';
import { USER_LOGOUT, UPDATE_USER } from './user/actions';

function getInitState() {
    return fromJS([]);
}

const store = (state = getInitState(), action) => {
    switch (action.type) {
        case RECEIVE_CLIENT_INSTANCES:
            return fromJS(action.value);
        case USER_LOGOUT:
        case UPDATE_USER:
            return getInitState();
        default:
            return state;
    }
};

export default store;
