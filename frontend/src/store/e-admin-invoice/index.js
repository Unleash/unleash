import { List } from 'immutable';
import { RECEIVE_INVOICES } from './actions';

const store = (state = new List(), action) => {
    switch (action.type) {
        case RECEIVE_INVOICES:
            return new List(action.invoices);
        default:
            return state;
    }
};

export default store;
