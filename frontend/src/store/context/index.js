import { List } from 'immutable';
import { RECEIVE_CONTEXT, REMOVE_CONTEXT, ADD_CONTEXT_FIELD, UPDATE_CONTEXT_FIELD } from './actions';
import { USER_LOGOUT, USER_LOGIN } from '../user/actions';

const DEFAULT_CONTEXT_FIELDS = [
    { name: 'environment', initial: true },
    { name: 'userId', initial: true },
    { name: 'appName', initial: true },
];

function getInitState() {
    return new List(DEFAULT_CONTEXT_FIELDS);
}

const strategies = (state = getInitState(), action) => {
    switch (action.type) {
        case RECEIVE_CONTEXT:
            return new List(action.value);
        case REMOVE_CONTEXT:
            return state.remove(state.indexOf(action.context));
        case ADD_CONTEXT_FIELD:
            return state.push(action.context);
        case UPDATE_CONTEXT_FIELD: {
            const index = state.findIndex(item => item.name === action.context.name);
            return state.set(index, action.context);
        }
        case USER_LOGOUT:
        case USER_LOGIN:
            return getInitState();
        default:
            return state;
    }
};

export default strategies;
