import { List } from 'immutable';
import { RECIEVE_KEYS, ADD_KEY, REMOVE_KEY } from './actions';

const store = (state = new List(), action) => {
    switch (action.type) {
        case RECIEVE_KEYS:
            return new List(action.tokens);
        case ADD_KEY:
            return state.push(action.token);
        case REMOVE_KEY:
            return state.filter(v => v.secret !== action.secret);
        default:
            return state;
    }
};

export default store;
