import { List, fromJS } from 'immutable';
import { RECEIVE_USERS } from './actions';

function getInitialState() {
    return fromJS({
        root: [],
    });
}

const store = (state = getInitialState(), action) => {
    switch (action.type) {
        case RECEIVE_USERS:
            return state.set('root', new List(action.value.rootRoles));
        default:
            return state;
    }
};

export default store;
