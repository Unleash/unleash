import { Map } from 'immutable';
import { RECIEVE_API_DETAILS } from './actions';

const store = (state = new Map(), action) => {
    switch (action.type) {
        case RECIEVE_API_DETAILS:
            state = new Map(action.value);
            return state;
        default:
            return state;
    }
};

export default store;
