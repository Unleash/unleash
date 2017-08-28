import { List, Map as $Map } from 'immutable';
import { RECEIVE_HISTORY, RECEIVE_HISTORY_FOR_TOGGLE } from './history-actions';

function getInitState() {
    return new $Map({ list: new List(), toggles: new $Map() });
}

const historyStore = (state = getInitState(), action) => {
    switch (action.type) {
        case RECEIVE_HISTORY_FOR_TOGGLE:
            return state.setIn(['toggles', action.value.toggleName], new List(action.value.events));
        case RECEIVE_HISTORY:
            return state.set('list', new List(action.value));
        default:
            return state;
    }
};

export default historyStore;
