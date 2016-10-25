import { List, Map as $Map } from 'immutable';
import { RECEIVE_HISTORY } from './history-actions';

function getInitState () {
    return new $Map({ list: new List() });
}

const historyStore = (state = getInitState(), action) => {
    switch (action.type) {
        case RECEIVE_HISTORY:
            return state.set('list', new List(action.value));
        default:
            return state;
    }
};

export default historyStore;
