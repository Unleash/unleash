import { fromJS } from 'immutable';
import { RECEIVE_CLIENT_INSTANCES } from './client-instance-actions';

function getInitState() {
    return fromJS([]);
}

const store = (state = getInitState(), action) => {
    switch (action.type) {
        case RECEIVE_CLIENT_INSTANCES:
            return fromJS(action.value);
        default:
            return state;
    }
};

export default store;
