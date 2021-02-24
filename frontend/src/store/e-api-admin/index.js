import { List } from 'immutable';
import { RECIEVE_KEYS, ADD_KEY, REMOVE_KEY } from './actions';

const store = (state = new List(), action) => {
    switch (action.type) {
        case RECIEVE_KEYS:
            return new List(action.keys);
        case ADD_KEY:
            return state.push(action.token);
        case REMOVE_KEY:
            return state.filter(v => v.key !== action.key);
        default:
            return state;
    }
};

export default store;
